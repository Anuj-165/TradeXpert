import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  if (!user) return null;

  const handleSave = () => {
    // Here you would typically update the user data via API
    console.log('Saving user data:', editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
          >
            <Edit className="h-5 w-5" />
          </motion.button>
        ) : (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className="p-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <Save className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancel}
              className="p-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-gray-500" />
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Mail className="h-5 w-5 text-gray-500" />
          {isEditing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          ) : (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="h-5 w-5 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(user.joinedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;