const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    username: String,
    password: String,
    userType: String,
    subject: String,
});

const Teacher = mongoose.model('Teacher', teacherSchema);


mongoose.connect('mongodb+srv://rajlakkad115014:rajlakkadji1234@cluster0.j4bjeme.mongodb.net/student_performance?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });


const sampleTeacherData = {
    username: 'jainam',
    password: '123', 
    userType: 'teacher',
    subject:'.NET',
};


const insertTeacherData = async () => {
    try {
        const newTeacher = new Teacher(sampleTeacherData);
        await newTeacher.save();
        console.log('Teacher data inserted successfully!');
    } catch (error) {
        console.error('Error inserting teacher data:', error);
    } finally {
        
        mongoose.connection.close();
    }
};
insertTeacherData();
