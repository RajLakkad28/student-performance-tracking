const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const app = express();
app.use(session({
    secret: 'secret', 
    resave: false,
    saveUninitialized: true
}));

const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://rajlakkad115014:rajlakkadji1234@cluster0.j4bjeme.mongodb.net/student_performance?retryWrites=true&w=majority');


const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to MongoDB Atlas');
});

const teacherSchema = new mongoose.Schema({
    username: String,
    password: String,
    usertype: String,
    subject: String,
});

const Teacher = mongoose.model('Teacher', teacherSchema);

const studentSchema = new mongoose.Schema({
    username: String,
    password: String,
    usertype: String,
    name: String,
    enrollmentNo: String,
    gender: String,
    branch: String,
    p_name: String,
    p_contact: String,
    contactNumber: String,
    birth: String,
    address: String,
});

const Student = mongoose.model('Student', studentSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/register-student-page', (req, res) => {
    res.sendFile(__dirname + '/register_student.html');
});

app.get('/time-table', (req, res) => {
    res.sendFile(__dirname + '/timetable.html');
});

app.get('/time-table1', (req, res) => {
    res.sendFile(__dirname + '/timetable1.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/result', (req, res) => {
    res.sendFile(__dirname + '/result.html');
});

app.post('/teacher-dashboard', async (req, res) => {
    return res.status(400).send(`
        <script>
            window.location = '/teacher-dashboard-page';
        </script>
    `);
});

app.post('/register-student', async (req, res) => {
    const { username, password, name, enrollmentNo, gender, p_name, p_contact, branch, contactNumber, birth, address } = req.body;

    try {
        const existingStudentUsername = await Student.findOne({ username });

        if (existingStudentUsername) {
            console.log('Error: Username already exists');
            return res.status(400).send(`
                <script>
                    alert('Error: Username already exists');
                    window.location = '/register-student-page';
                </script>
            `);
        }

        if (username === "" || password === "" || name === "" || enrollmentNo === "" || gender === "" || branch === "" || p_name === "" || p_contact === "" || contactNumber === "" || birth === "" || address === "") {
            console.log('Error: All fields are required');
            return res.status(400).send(`
                <script>
                    alert('Error: All fields are required');
                    window.location = '/register-student-page';
                </script>
            `);
        }

        const newStudent = new Student({
            username,
            password,
            usertype: 'student',
            name,
            enrollmentNo,
            gender,
            p_name,
            p_contact,
            branch,
            contactNumber,
            birth,
            address,
        });

        await newStudent.save();

        console.log('Student Registration Successful');

        res.send(`
            <script>
                alert('Student Registration Successful');
                window.location = '/register-student-page';
            </script>
        `);
    } catch (error) {
        console.error('Error during student registration:', error);

        res.status(500).send(`
            <script>
                alert('Internal Server Error');
                window.location = '/register-student-page';
            </script>
        `);
    }
});

app.post('/login', async (req, res) => {
    const { userType, username, password } = req.body;

    try {
        if (userType === 'teacher') {
            const teacher = await Teacher.findOne({ username, password });

            if (teacher) {
                console.log('Teacher Login Successful');
                req.session.subject = teacher.subject; 
                console.log('Subjects:', req.session.subject)
                res.redirect('/time-table');
            } else {
                console.log('Error: Teacher Username or password is incorrect');
                return res.status(400).send(`
                    <script>
                        alert('Error: Teacher Username or password is incorrect');
                        window.location = '/index';
                    </script>
                `);
            }
        } else if (userType === 'student') {
            const student = await Student.findOne({ username, password });

            if (student) {
                console.log('Student Login Successful');
                req.session.usename = student.username;
                console.log(username);
                res.redirect('/student-dashboard');
            } else {
                console.log('Error: Student Username or password is incorrect');
                return res.status(400).send(`
                    <script>
                        alert('Error: Student Username or password is incorrect');
                        window.location = '/index';
                    </script>
                `);
            }
        } else {
            console.log('Invalid User Type');
            res.status(400).send('Invalid User Type');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/teacher-dashboard', (req, res) => {
    res.sendFile(__dirname + '/teacher_dashboard.html');
});

app.get('/student-dashboard', (req, res) => {
    res.sendFile(__dirname + '/student_dashboard.html');
});

app.get('/add-marks', (req, res) => {
    res.sendFile(__dirname + '/add_marks.html');
});

app.get('/Attendance-page', (req, res) => {
    res.sendFile(__dirname + '/Attendance.html');
});

app.get('/display-result1', (req, res) => {
    res.sendFile(__dirname + '/display_result.html');
});

app.get('/events', (req, res) => {
    res.sendFile(__dirname + '/events.html');
});

app.get('/fetch-student-usernames', async (req, res) => {
    try {
         const subject = req.session.subject; 
        console.log('Subjects:', req.session.subject)
        if (!subject) {
            return res.redirect('/');
        }
        const students = await Student.find({}, 'username'); 
        const usernames = students.map(student => student.username);
        res.json(usernames);
    } catch (error) {
        console.error('Error fetching student usernames:', error);
        res.status(500).send('Internal Server Error');
    }
});

const studentMarksSchema = new mongoose.Schema({
    username: String,
    subject:String,
    mid1: Number,
    mid2: Number,
    ese: Number
});

const StudentMarks = mongoose.model('StudentMarks', studentMarksSchema);

app.use(bodyParser.json());

app.post('/add-marks', async (req, res) => {
    try {
        const marksData = req.body.marks;
        const subject = req.session.subject; 
        console.log('Subjects:', req.session.subject)
        if (!subject) {
            return res.redirect('/');
        }


        for (const mark of marksData) {
            const { username, mid1, mid2, ese } = mark;

            const existingMarks = await StudentMarks.findOne({ username, subject });

            if (existingMarks) {
                existingMarks.mid1 = mid1;
                existingMarks.mid2 = mid2;
                existingMarks.ese = ese;
                await existingMarks.save();
            } else {
                await StudentMarks.create({ username, subject, mid1, mid2, ese });
            }
        }

        res.status(200).send('Marks added successfully to the database');
    } catch (error) {
        console.error('Error adding marks:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/student-marks', async (req, res) => {
    try {
        const username = req.session.usename; 
        const studentMarks = await StudentMarks.find({ username });
        res.json(studentMarks);
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/teacher-marks', async (req, res) => {
    try {
        const subject = req.session.subject;
        const teacherMarks = await StudentMarks.find({ subject });
        res.json(teacherMarks);
    } catch (error) {
        console.error('Error fetching teacher marks:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const attendanceSchema = new mongoose.Schema({
    username: String,
    subject: String,
    attendance: String
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

app.use(bodyParser.json());

app.post('/add-attendance', async (req, res) => {
    try {
        const attendanceData = req.body.attendance;
        const subject = req.session.subject; 

        for (const data of attendanceData) {
            const { username, attendance } = data;

            let existingAttendance = await Attendance.findOne({ username, subject });

            if (existingAttendance) {
                existingAttendance.attendance = attendance;
                await existingAttendance.save();
            } else {
                const newAttendance = new Attendance({ username, subject, attendance });
                await newAttendance.save();
            }
        }

        res.status(200).send('Attendance added/updated successfully');
    } catch (error) {
        console.error('Error adding/updating attendance:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/store-selected-username', (req, res) => {
    const { selectedUsername } = req.body;
    req.session.selectedUsername = selectedUsername;
    res.sendStatus(200);
});

app.get('/display-result', async (req, res) => {
    try {
        const selectedUsername = req.session.selectedUsername; 
        const studentMarks = await StudentMarks.find({ username: selectedUsername });
        res.json(studentMarks);
    } catch (error) {
        console.error('Error fetching student marks:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/student-attendance1', async (req, res) => {
    try {
        const selectedUsername = req.session.selectedUsername; 
        const attendanceData = await Attendance.find({username: selectedUsername });
        res.json(attendanceData);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/fetch-events1', async (req, res) => {
    try {
        const selectedUsername = req.session.selectedUsername;  
        
        const eventsData = await Events.find({ username: selectedUsername });
        
        res.json(eventsData);
    } catch (error) {
        console.error('Error fetching events data:', error);
        res.status(500).send('Internal Server Error');
    }
});
const eventsSchema = new mongoose.Schema({
    username: String,
    events: Number
});

const Events = mongoose.model('Events', eventsSchema);

app.use(bodyParser.json());

app.post('/add-events', async (req, res) => {
    try {
        const eventsData = req.body.events;

        for (const data of eventsData) {
            const { username, events } = data;

            let existingEvents = await Events.findOne({ username });

            if (existingEvents) {
                existingEvents.events = events;
                await existingEvents.save();
            } else {
                const newEvents = new Events({ username, events });
                await newEvents.save();
            }
        }

        res.status(200).send('Events added/updated successfully');
    } catch (error) {
        console.error('Error adding/updating events:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/student-attendance', async (req, res) => {
    try {
        const username = req.session.usename;
        const attendanceData = await Attendance.find({ username });
        res.json(attendanceData);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/fetch-events', async (req, res) => {
    try {
        const username = req.session.usename; 
        
        const eventsData = await Events.find({ username });
        
        res.json(eventsData);
    } catch (error) {
        console.error('Error fetching events data:', error);
        res.status(500).send('Internal Server Error');
    }
});



        
        


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
