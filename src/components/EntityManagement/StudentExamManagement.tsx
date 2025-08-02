import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { StudentExam, Exam, Student } from '../../types';
import { apiService } from '../../services/api';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Modal } from '../UI/Modal';
import { Table } from '../UI/Table';
import { StudentExamForm } from '../Forms/StudentExamForm';

interface StudentExamWithDetails extends StudentExam {
  student?: Student;
  exam?: Exam & { course?: any };
}
export const StudentExamManagement: React.FC = () => {
  const [studentExams, setStudentExams] = useState<StudentExamWithDetails[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [examStudents, setExamStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentExam, setEditingStudentExam] = useState<StudentExamWithDetails | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const fetchAllExams = async () => {
    try {
      const response = await apiService.getAllExams();
      setAllExams(response.exams || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
  };

  const fetchStudentExamsByExam = async (examId: number) => {
    setLoading(true);
    try {
      const response = await apiService.getStudentExams();
      const allStudentExams = response.studentExams || [];
      
      // Filter by selected exam
      const examStudentExams = allStudentExams.filter((se: any) => se.exam?.id === examId);
      setStudentExams(examStudentExams);
      
      // Get the exam details to find course students
      const selectedExamData = allExams.find(exam => exam.id === examId);
      if (selectedExamData?.course) {
        await fetchExamStudents(selectedExamData.course.id);
      }
    } catch (error) {
      console.error('Failed to fetch student exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStudents = async (courseId: number) => {
    try {
      // Get all students enrolled in the course
      const courseResponse = await apiService.getById('courses', courseId);
      const course = courseResponse.course || courseResponse;
      const enrolledStudentIds = course.students?.map((s: any) => typeof s === 'object' ? s.id : s) || [];
      
      const studentsResponse = await apiService.getAll('students');
      const allStudents = studentsResponse.students || [];
      const courseStudents = allStudents.filter((student: Student) => 
        enrolledStudentIds.includes(student.id)
      );
      
      setExamStudents(courseStudents);
    } catch (error) {
      console.error('Failed to fetch exam students:', error);
    }
  };

  const fetchAllStudentExams = async () => {
    setLoading(true);
    try {
      const response = await apiService.getStudentExams();
      setStudentExams(response.studentExams || []);
    } catch (error) {
      console.error('Failed to fetch student exams:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllExams();
    fetchAllStudentExams();
  }, []);

  const handleExamChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const examId = parseInt(e.target.value);
    if (!examId) {
      setSelectedExam(null);
      fetchAllStudentExams();
      return;
    }

    setSelectedExam(examId);
    await fetchStudentExamsByExam(examId);
  };

  const handleSave = async (studentExamData: StudentExam) => {
  try {
    setValidationErrors({});
    if (editingStudentExam?.id) {
      await apiService.update("stdExam", editingStudentExam.id, studentExamData);
    } else {
      await apiService.create("stdExam", studentExamData);
    }
    await fetchStudentExams();
    setIsModalOpen(false);
    setEditingStudentExam(null);
  } catch (error: any) {
    console.error("Failed to save student exam:", error);
    if (error.response?.status === 422) {
      setValidationErrors(error.response.data.errors);
    }
  }
};

  const handleDelete = async (studentExam: StudentExam) => {
    if (window.confirm('Are you sure you want to delete this student exam record?')) {
      try {
        await apiService.delete('stdExam', studentExam.id!);
        await fetchStudentExams();
      } catch (error) {
        console.error('Failed to delete student exam:', error);
      }
      
      if (selectedExam) {
        await fetchStudentExamsByExam(selectedExam);
      } else {
        await fetchAllStudentExams();
      }
      
  };

  const filteredStudentExams = studentExams.filter(record =>
  const handleDelete = async (studentExam: StudentExamWithDetails) => {
    record.student_id?.toString().includes(searchTerm)
  );

        if (selectedExam) {
          await fetchStudentExamsByExam(selectedExam);
        } else {
          await fetchAllStudentExams();
        }
    { key: 'exam_id', label: 'Exam ID' },
    { key: 'student_id', label: 'Student ID' },
    { 
      key: 'student_mark', 
      label: 'Mark',
      render: (value: number) => (
  const filteredStudentExams = studentExams.filter(record => {
    const studentName = record.student?.name?.toLowerCase() || '';
    const examTitle = record.exam?.title?.toLowerCase() || '';
    const courseName = record.exam?.course?.title?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return studentName.includes(searchLower) ||
           examTitle.includes(searchLower) ||
           courseName.includes(searchLower);
  });

  const examOptions = allExams.map(exam => ({
    value: exam.id!,
    label: `${exam.title} - ${exam.course?.title || 'Unknown Course'}`
  }));

  const selectedExamData = allExams.find(exam => exam.id === selectedExam);

  const columns = [
    { 
      key: 'student_name', 
      label: 'Student Name',
      render: (_: any, record: StudentExamWithDetails) => (
        <div className="flex items-center space-x-3">
          {record.student?.student_img && (
            <img
              src={record.student.student_img}
              alt={record.student.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <span className="font-medium">{record.student?.name || 'N/A'}</span>
        </div>
      )
    },
    { 
      key: 'exam_title', 
      label: 'Exam Name',
      render: (_: any, record: StudentExamWithDetails) => (
        <span className="font-medium text-[#0e4d3c]">{record.exam?.title || 'N/A'}</span>
      )
    },
    { 
      key: 'course_name', 
      label: 'Course Name',
      render: (_: any, record: StudentExamWithDetails) => (
        <span>{record.exam?.course?.title || 'N/A'}</span>
      )
    },
    { 
      key: 'max_mark', 
      label: 'Max Mark',
      render: (_: any, record: StudentExamWithDetails) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
          {record.exam?.max_mark || 'N/A'}
        </span>
      )
    },
    { 
      key: 'passing_mark', 
      label: 'Passing Mark',
      render: (_: any, record: StudentExamWithDetails) => (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
          {record.exam?.passing_mark || 'N/A'}
        </span>
      )
    },
    { 
      key: 'student_mark', 
      label: 'Student Mark',
      render: (value: number, record: StudentExamWithDetails) => {
        const passingMark = record.exam?.passing_mark || 0;
        const isPassing = value >= passingMark;
        return (

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            label="Select Exam"
            value={selectedExam || ""}
            onChange={handleExamChange}
            options={examOptions}
          />
          
          {selectedExam && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search student exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Student Exam
        </Button>
      </div>

      {/* Show exam details if selected */}
      {selectedExam && selectedExamData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Exam Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Exam:</span>
              <p className="text-gray-800">{selectedExamData.title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Course:</span>
              <p className="text-gray-800">{selectedExamData.course?.title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Max Mark:</span>
              <p className="text-gray-800">{selectedExamData.max_mark}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Passing Mark:</span>
              <p className="text-gray-800">{selectedExamData.passing_mark}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {selectedExam && (
          <div className="relative">
            <h4 className="text-md font-medium text-gray-700 mb-2">
              Students who have taken this exam: {filteredStudentExams.length}
            </h4>
          </div>
        )}
        
        <Table
          columns={columns}
          data={filteredStudentExams}
          onEdit={(studentExam) => {
            setEditingStudentExam(studentExam);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>

      {/* Show message when no exams available */}
      {!loading && allExams.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Exams Available
          </h3>
          <p className="text-gray-500">
            Please create exams first to manage student exam records.
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudentExam(null);
        }}
        title={editingStudentExam ? 'Edit Student Exam' : 'Add New Student Exam'}
        size="lg"
      >
        <StudentExamForm
          initialData={editingStudentExam}
          examStudents={examStudents}
          selectedExam={selectedExamData}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingStudentExam(null);
          }}
          validationErrors={validationErrors}
        />
      </Modal>
    </div>
  );
};