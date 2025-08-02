import React, { useState, useEffect } from 'react';
import { StudentExam, Exam, Student } from '../../types';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';

interface StudentExamFormProps {
  initialData?: StudentExam | null;
  examStudents?: Student[];
  selectedExam?: Exam & { course?: any };
  onSave: (data: StudentExam) => void;
  onCancel: () => void;
  validationErrors?: Record<string, string[]>;
}

export const StudentExamForm: React.FC<StudentExamFormProps> = ({
  initialData,
  examStudents = [],
  selectedExam,
  onSave,
  onCancel,
  validationErrors = {},
}) => {
  const [formData, setFormData] = useState<StudentExam>({
    exam_id: 0,
    student_id: 0,
    student_mark: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (selectedExam) {
      // Pre-fill exam_id if we have a selected exam
      setFormData(prev => ({ ...prev, exam_id: selectedExam.id! }));
    }
  }, [initialData]);


  const handleChange = (field: keyof StudentExam, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const studentOptions = examStudents.map((student) => ({
    value: student.id!,
    label: student.name,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">
          {initialData ? 'Edit Student Exam' : 'Add Student Exam'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {initialData ? 'Update the student exam details below' : 'Fill in the details to create a new student exam record'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Exam Information */}
        {selectedExam && (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              Exam Information
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Exam:</span>
                  <p className="text-gray-800">{selectedExam.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Course:</span>
                  <p className="text-gray-800">{selectedExam.course?.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Max Mark:</span>
                  <p className="text-gray-800">{selectedExam.max_mark}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student Selection */}
        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
            Student & Mark
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Student"
              value={formData.student_id}
              onChange={(e) => handleChange('student_id', parseInt(e.target.value))}
              options={studentOptions}
              error={validationErrors.student_id?.[0]}
              required
            />
            <Input
              label="Student Mark"
              type="number"
              min="0"
              max={selectedExam?.max_mark}
              value={formData.student_mark}
              onChange={(e) => handleChange('student_mark', parseInt(e.target.value))}
              error={validationErrors.student_mark?.[0]}
              helperText={selectedExam ? `Maximum mark: ${selectedExam.max_mark}, Passing mark: ${selectedExam.passing_mark}` : undefined}
              required
            />
          </div>
        </div>


        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onCancel} size="lg">
            Cancel
          </Button>
          <Button type="submit" loading={loading} size="lg">
            {initialData ? 'Update Student Exam' : 'Create Student Exam'}
          </Button>
        </div>
      </form>
    </div>
  );
};
