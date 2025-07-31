import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {Group, User} from '../types';
import {StorageService} from '../services/StorageService';
import {generateId, validateEmail, formatDate} from '../utils/helpers';

const GroupManagementScreen: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [tempMembers, setTempMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserAndGroups();
    }, [])
  );

  const loadUserAndGroups = async () => {
    try {
      const [currentUser, userGroups] = await Promise.all([
        StorageService.getUser(),
        StorageService.getGroups(),
      ]);
      setUser(currentUser);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading user and groups:', error);
    }
  };

  const resetModal = () => {
    setGroupName('');
    setMemberEmail('');
    setTempMembers([]);
    setModalVisible(false);
  };

  const addMemberToTemp = () => {
    if (!memberEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!validateEmail(memberEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (tempMembers.includes(memberEmail.toLowerCase())) {
      Alert.alert('Error', 'This email is already added');
      return;
    }

    if (user && memberEmail.toLowerCase() === user.email.toLowerCase()) {
      Alert.alert('Error', 'You cannot add yourself as a member');
      return;
    }

    setTempMembers([...tempMembers, memberEmail.toLowerCase()]);
    setMemberEmail('');
  };

  const removeMemberFromTemp = (email: string) => {
    setTempMembers(tempMembers.filter(member => member !== email));
  };

  const validateGroupForm = (): boolean => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return false;
    }

    if (tempMembers.length === 0) {
      Alert.alert('Error', 'Please add at least one member to the group');
      return false;
    }

    if (!user) {
      Alert.alert('Error', 'User information not found');
      return false;
    }

    return true;
  };

  const handleCreateGroup = async () => {
    if (!validateGroupForm()) return;

    setIsLoading(true);

    try {
      const newGroup: Group = {
        id: generateId(),
        name: groupName.trim(),
        members: [...tempMembers, user!.email],
        createdBy: user!.id,
        createdAt: new Date(),
      };

      await StorageService.saveGroup(newGroup);
      
      Alert.alert(
        'Success',
        `Group "${newGroup.name}" has been created with ${tempMembers.length} member(s)`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetModal();
              loadUserAndGroups();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedGroups = groups.filter(g => g.id !== groupId);
              await Promise.all(
                updatedGroups.map(group => StorageService.saveGroup(group))
              );
              loadUserAndGroups();
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const renderGroupItem = ({item}: {item: Group}) => {
    const isOwner = user && item.createdBy === user.id;
    
    return (
      <View style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupDetails}>
              {item.members.length} member(s) • Created {formatDate(item.createdAt)}
            </Text>
            {isOwner && (
              <View style={styles.ownerBadge}>
                <Icon name="star" size={16} color="#FF9800" />
                <Text style={styles.ownerText}>Owner</Text>
              </View>
            )}
          </View>
          
          {isOwner && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteGroup(item.id, item.name)}
            >
              <Icon name="delete" size={24} color="#F44336" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.membersContainer}>
          <Text style={styles.membersTitle}>Members:</Text>
          {item.members.map((member, index) => (
            <View key={index} style={styles.memberItem}>
              <Icon name="person" size={16} color="#666" />
              <Text style={styles.memberEmail}>{member}</Text>
              {member === user?.email && (
                <Text style={styles.youLabel}>(You)</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTempMember = ({item}: {item: string}) => (
    <View style={styles.tempMemberItem}>
      <Icon name="person" size={16} color="#666" />
      <Text style={styles.tempMemberEmail}>{item}</Text>
      <TouchableOpacity
        style={styles.removeMemberButton}
        onPress={() => removeMemberFromTemp(item)}
      >
        <Icon name="close" size={16} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="group-add" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptyText}>
            Create a group to share scheduled events with friends, family, or colleagues
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Group</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={resetModal}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Group Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter group name..."
                  value={groupName}
                  onChangeText={setGroupName}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Add Members</Text>
                <View style={styles.addMemberContainer}>
                  <TextInput
                    style={[styles.input, styles.memberInput]}
                    placeholder="Enter member's email..."
                    value={memberEmail}
                    onChangeText={setMemberEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={addMemberToTemp}
                  >
                    <Icon name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {tempMembers.length > 0 && (
                <View style={styles.tempMembersContainer}>
                  <Text style={styles.label}>Members to Add:</Text>
                  <FlatList
                    data={tempMembers}
                    renderItem={renderTempMember}
                    keyExtractor={(item) => item}
                    style={styles.tempMembersList}
                  />
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createGroupButton, isLoading && styles.createGroupButtonDisabled]}
                onPress={handleCreateGroup}
                disabled={isLoading}
              >
                <Text style={styles.createGroupButtonText}>
                  {isLoading ? 'Creating...' : 'Create Group'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ownerText: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  membersContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  membersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  youLabel: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addMemberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInput: {
    flex: 1,
    marginRight: 12,
  },
  addMemberButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempMembersContainer: {
    marginBottom: 20,
  },
  tempMembersList: {
    maxHeight: 120,
  },
  tempMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  tempMemberEmail: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
  },
  removeMemberButton: {
    padding: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  createGroupButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  createGroupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createGroupButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default GroupManagementScreen;