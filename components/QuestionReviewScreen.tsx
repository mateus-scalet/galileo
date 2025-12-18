// FIX: Created the QuestionReviewScreen component as a wrapper around QuestionEditor for the AI curation flow.
import React from 'react';
import { InterviewQuestion, JobDetails } from '../types';
import QuestionEditor from './QuestionEditor';

interface QuestionReviewScreenProps {
  initialQuestions: InterviewQuestion[];
  jobDetails: JobDetails;
}

const QuestionReviewScreen: React.FC<QuestionReviewScreenProps> = ({ initialQuestions, jobDetails }) => {
  return (
    <QuestionEditor
      initialQuestions={initialQuestions}
      jobDetails={jobDetails}
      isEditing={false}
    />
  );
};

export default QuestionReviewScreen;
