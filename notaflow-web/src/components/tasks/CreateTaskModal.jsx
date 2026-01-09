import React from 'react';
import TaskForm from './TaskForm';

const CreateTaskModal = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <TaskForm
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
};

export default CreateTaskModal;