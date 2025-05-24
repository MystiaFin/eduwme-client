import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true, unique: true },  
  courseId: { type: String, required: true},
  courseBatchId: { type: String, required: true},
  title: { type: String, required: true },
  difficultyLevel: { type: Number, required: true },
  dateCreated: { type: Date, required: true },
  animType: { type: String, required: true },
  type: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answer: { type: String, required: true }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
export default Exercise;