// Mock data for Dekho_Exam Admin Dashboard

export const categories = [
  { id: '1', name: 'SSC Constable', description: 'Staff Selection Commission Constable GD examination preparation', image: null, subjectsCount: 6, testsCount: 45, isActive: true, displayOrder: 1 },
  { id: '2', name: 'SSC GD', description: 'SSC General Duty preparation with comprehensive study materials', image: null, subjectsCount: 5, testsCount: 38, isActive: true, displayOrder: 2 },
  { id: '3', name: 'Railway NTPC', description: 'Railway Non-Technical Popular Categories examination prep', image: null, subjectsCount: 7, testsCount: 52, isActive: true, displayOrder: 3 },
  { id: '4', name: 'Banking PO', description: 'Bank Probationary Officer exam preparation', image: null, subjectsCount: 6, testsCount: 40, isActive: true, displayOrder: 4 },
  { id: '5', name: 'UPSC CSAT', description: 'Civil Services Aptitude Test preparation', image: null, subjectsCount: 8, testsCount: 35, isActive: true, displayOrder: 5 },
  { id: '6', name: 'NEET', description: 'National Eligibility cum Entrance Test for medical aspirants', image: null, subjectsCount: 4, testsCount: 60, isActive: true, displayOrder: 6 },
  { id: '7', name: 'JEE Main', description: 'Joint Entrance Examination for engineering colleges', image: null, subjectsCount: 3, testsCount: 55, isActive: true, displayOrder: 7 },
  { id: '8', name: 'State PSC', description: 'State Public Service Commission examinations', image: null, subjectsCount: 6, testsCount: 28, isActive: false, displayOrder: 8 },
];

export const subjects = [
  { id: '1', name: 'Mathematics', description: 'Quantitative aptitude, arithmetic, algebra, geometry', image: null, categoriesUsed: 5, totalQuestions: 2450, isActive: true },
  { id: '2', name: 'English', description: 'Grammar, vocabulary, comprehension, verbal ability', image: null, categoriesUsed: 6, totalQuestions: 1890, isActive: true },
  { id: '3', name: 'Reasoning', description: 'Logical reasoning, analytical ability, puzzles', image: null, categoriesUsed: 7, totalQuestions: 2100, isActive: true },
  { id: '4', name: 'General Knowledge', description: 'Current affairs, static GK, history, geography', image: null, categoriesUsed: 8, totalQuestions: 3200, isActive: true },
  { id: '5', name: 'Physics', description: 'Mechanics, thermodynamics, optics, modern physics', image: null, categoriesUsed: 2, totalQuestions: 1560, isActive: true },
  { id: '6', name: 'Chemistry', description: 'Organic, inorganic, physical chemistry', image: null, categoriesUsed: 2, totalQuestions: 1420, isActive: true },
  { id: '7', name: 'Biology', description: 'Botany, zoology, human physiology', image: null, categoriesUsed: 1, totalQuestions: 1800, isActive: true },
  { id: '8', name: 'Computer Awareness', description: 'Basic computer knowledge, MS Office, internet', image: null, categoriesUsed: 3, totalQuestions: 680, isActive: true },
  { id: '9', name: 'Hindi', description: 'Hindi grammar, literature, comprehension', image: null, categoriesUsed: 4, totalQuestions: 950, isActive: true },
  { id: '10', name: 'Current Affairs', description: 'Latest news, events, government schemes', image: null, categoriesUsed: 8, totalQuestions: 2800, isActive: true },
];

export const topics = [
  { id: '1', subjectId: '1', name: 'Number System', description: 'Concepts of natural numbers, integers, fractions', hasStudyMaterial: true, hasVideo: true, questionsCount: 320 },
  { id: '2', subjectId: '1', name: 'Percentage', description: 'Percentage calculations and applications', hasStudyMaterial: true, hasVideo: true, questionsCount: 280 },
  { id: '3', subjectId: '1', name: 'Profit and Loss', description: 'Business mathematics concepts', hasStudyMaterial: true, hasVideo: false, questionsCount: 245 },
  { id: '4', subjectId: '1', name: 'Simple Interest', description: 'Interest calculations and formulas', hasStudyMaterial: true, hasVideo: true, questionsCount: 180 },
  { id: '5', subjectId: '1', name: 'Compound Interest', description: 'Compound interest and its applications', hasStudyMaterial: true, hasVideo: true, questionsCount: 165 },
  { id: '6', subjectId: '2', name: 'Tenses', description: 'Past, present, future tenses', hasStudyMaterial: true, hasVideo: true, questionsCount: 290 },
  { id: '7', subjectId: '2', name: 'Active/Passive Voice', description: 'Voice transformation rules', hasStudyMaterial: true, hasVideo: false, questionsCount: 210 },
  { id: '8', subjectId: '2', name: 'Direct/Indirect Speech', description: 'Narration change rules', hasStudyMaterial: true, hasVideo: true, questionsCount: 185 },
  { id: '9', subjectId: '3', name: 'Blood Relations', description: 'Family tree based problems', hasStudyMaterial: true, hasVideo: true, questionsCount: 340 },
  { id: '10', subjectId: '3', name: 'Coding-Decoding', description: 'Pattern recognition in codes', hasStudyMaterial: true, hasVideo: true, questionsCount: 380 },
];

export const questions = [
  { id: '1', subjectId: '1', topicId: '1', text: 'What is the LCM of 12, 15, and 20?', options: ['60', '120', '180', '240'], correctOption: 0, difficulty: 'Easy', explanation: 'LCM = 60. Breaking down: 12=2²×3, 15=3×5, 20=2²×5. LCM = 2²×3×5 = 60', isActive: true, createdAt: '2024-01-15' },
  { id: '2', subjectId: '1', topicId: '1', text: 'Find the HCF of 36 and 48.', options: ['6', '12', '18', '24'], correctOption: 1, difficulty: 'Easy', explanation: 'HCF = 12. 36=2²×3², 48=2⁴×3. Common factors: 2²×3 = 12', isActive: true, createdAt: '2024-01-15' },
  { id: '3', subjectId: '1', topicId: '2', text: 'If the price of a product increases by 20%, by what percentage should it be reduced to get the original price?', options: ['16.67%', '20%', '25%', '15%'], correctOption: 0, difficulty: 'Medium', explanation: 'Required reduction = (20/120)×100 = 16.67%', isActive: true, createdAt: '2024-01-16' },
  { id: '4', subjectId: '2', topicId: '6', text: 'Choose the correct form: She ___ to the market yesterday.', options: ['go', 'goes', 'went', 'going'], correctOption: 2, difficulty: 'Easy', explanation: 'Past tense of "go" is "went". "Yesterday" indicates past tense.', isActive: true, createdAt: '2024-01-16' },
  { id: '5', subjectId: '3', topicId: '9', text: 'Pointing to a photograph, Ramesh said "She is the daughter of my grandfather\'s only son." How is the person in the photograph related to Ramesh?', options: ['Sister', 'Mother', 'Aunt', 'Daughter'], correctOption: 0, difficulty: 'Medium', explanation: 'Grandfather\'s only son = Father. Father\'s daughter = Sister', isActive: true, createdAt: '2024-01-17' },
];

export const tests = [
  { id: '1', name: 'SSC Constable Mock Test 1', categoryId: '1', description: 'Full length mock test for SSC Constable', duration: 60, totalQuestions: 100, positiveMarks: 1, negativeMarks: 0.25, type: 'Free', testNumber: 1, isActive: true },
  { id: '2', name: 'SSC Constable Mock Test 2', categoryId: '1', description: 'Practice test focusing on reasoning', duration: 60, totalQuestions: 100, positiveMarks: 1, negativeMarks: 0.25, type: 'Paid', testNumber: 2, isActive: true },
  { id: '3', name: 'Railway NTPC Mock Test 1', categoryId: '3', description: 'Comprehensive Railway NTPC preparation', duration: 90, totalQuestions: 100, positiveMarks: 1, negativeMarks: 0.33, type: 'Free', testNumber: 1, isActive: true },
  { id: '4', name: 'Banking PO Prelims Mock', categoryId: '4', description: 'Bank PO preliminary examination mock', duration: 60, totalQuestions: 100, positiveMarks: 1, negativeMarks: 0.25, type: 'Paid', testNumber: 1, isActive: true },
  { id: '5', name: 'NEET Biology Test 1', categoryId: '6', description: 'Biology focused test for NEET', duration: 60, totalQuestions: 50, positiveMarks: 4, negativeMarks: 1, type: 'Free', testNumber: 1, isActive: true },
  { id: '6', name: 'JEE Main Physics Mock', categoryId: '7', description: 'Physics test for JEE Main preparation', duration: 60, totalQuestions: 30, positiveMarks: 4, negativeMarks: 1, type: 'Paid', testNumber: 1, isActive: true },
];

export const subscriptionPlans = [
  { id: '1', name: 'SSC Complete', description: 'Complete access to SSC Constable materials', price: 499, durationDays: 180, type: 'Category', categoryId: '1', features: ['All mock tests', 'Study materials', 'Video lectures', 'Performance analytics'], isActive: true },
  { id: '2', name: 'Railway Master', description: 'Full Railway exam preparation package', price: 599, durationDays: 365, type: 'Category', categoryId: '3', features: ['50+ mock tests', 'Previous year papers', 'Topic-wise tests', 'Daily quizzes'], isActive: true },
  { id: '3', name: 'All Access Pass', description: 'Access all categories and features', price: 1499, durationDays: 365, type: 'All', categoryId: null, features: ['All 8 categories', 'Unlimited mock tests', 'Premium study materials', 'Live doubt sessions', 'Personal mentor'], isActive: true },
  { id: '4', name: 'NEET Pro', description: 'Complete NEET preparation', price: 999, durationDays: 365, type: 'Category', categoryId: '6', features: ['200+ mock tests', 'NCERT solutions', 'Video lectures', 'Performance tracking'], isActive: true },
  { id: '5', name: 'Banking Elite', description: 'Banking exam mastery program', price: 699, durationDays: 180, type: 'Category', categoryId: '4', features: ['All bank exams covered', 'Current affairs updates', 'Mock interviews', 'Resume building'], isActive: true },
];

export const users = [
  { id: '1', phone: '+91 98765 43210', email: 'rahul.sharma@gmail.com', name: 'Rahul Sharma', role: 'Student', freeTestsUsed: 2, activeSubscriptions: 1, registeredOn: '2024-01-01', lastLogin: '2024-01-18', status: 'Active' },
  { id: '2', phone: '+91 87654 32109', email: 'priya.singh@gmail.com', name: 'Priya Singh', role: 'Student', freeTestsUsed: 2, activeSubscriptions: 2, registeredOn: '2024-01-03', lastLogin: '2024-01-18', status: 'Active' },
  { id: '3', phone: '+91 76543 21098', email: 'amit.kumar@gmail.com', name: 'Amit Kumar', role: 'Student', freeTestsUsed: 1, activeSubscriptions: 0, registeredOn: '2024-01-05', lastLogin: '2024-01-17', status: 'Active' },
  { id: '4', phone: '+91 65432 10987', email: 'sneha.patel@gmail.com', name: 'Sneha Patel', role: 'Student', freeTestsUsed: 2, activeSubscriptions: 1, registeredOn: '2024-01-07', lastLogin: '2024-01-18', status: 'Active' },
  { id: '5', phone: '+91 54321 09876', email: 'vikram.roy@gmail.com', name: 'Vikram Roy', role: 'Admin', freeTestsUsed: 0, activeSubscriptions: 0, registeredOn: '2023-12-01', lastLogin: '2024-01-18', status: 'Active' },
  { id: '6', phone: '+91 43210 98765', email: 'neha.gupta@gmail.com', name: 'Neha Gupta', role: 'Student', freeTestsUsed: 2, activeSubscriptions: 1, registeredOn: '2024-01-10', lastLogin: '2024-01-16', status: 'Active' },
  { id: '7', phone: '+91 32109 87654', email: 'arjun.mehta@gmail.com', name: 'Arjun Mehta', role: 'Student', freeTestsUsed: 0, activeSubscriptions: 0, registeredOn: '2024-01-12', lastLogin: '2024-01-15', status: 'Inactive' },
  { id: '8', phone: '+91 21098 76543', email: 'kavya.reddy@gmail.com', name: 'Kavya Reddy', role: 'Student', freeTestsUsed: 2, activeSubscriptions: 3, registeredOn: '2024-01-02', lastLogin: '2024-01-18', status: 'Active' },
];

export const payments = [
  { id: 'TXN001', userId: '1', userName: 'Rahul Sharma', phone: '+91 98765 43210', planName: 'SSC Complete', amount: 499, gateway: 'Razorpay', status: 'Success', date: '2024-01-15 10:30:00' },
  { id: 'TXN002', userId: '2', userName: 'Priya Singh', phone: '+91 87654 32109', planName: 'All Access Pass', amount: 1499, gateway: 'Paytm', status: 'Success', date: '2024-01-14 14:45:00' },
  { id: 'TXN003', userId: '3', userName: 'Amit Kumar', phone: '+91 76543 21098', planName: 'Railway Master', amount: 599, gateway: 'Razorpay', status: 'Failed', date: '2024-01-14 09:15:00' },
  { id: 'TXN004', userId: '4', userName: 'Sneha Patel', phone: '+91 65432 10987', planName: 'NEET Pro', amount: 999, gateway: 'PhonePe', status: 'Success', date: '2024-01-13 16:20:00' },
  { id: 'TXN005', userId: '6', userName: 'Neha Gupta', phone: '+91 43210 98765', planName: 'Banking Elite', amount: 699, gateway: 'Razorpay', status: 'Pending', date: '2024-01-13 11:00:00' },
  { id: 'TXN006', userId: '8', userName: 'Kavya Reddy', phone: '+91 21098 76543', planName: 'All Access Pass', amount: 1499, gateway: 'Paytm', status: 'Success', date: '2024-01-12 13:30:00' },
];

export const dashboardStats = {
  totalUsers: 15847,
  userGrowth: 12.5,
  totalCategories: 8,
  totalQuestions: 18050,
  activeSubscriptions: 4523,
  totalRevenue: 2847500,
  revenueGrowth: 18.3,
};

export const userRegistrationData = [
  { date: '2024-01-01', users: 145 },
  { date: '2024-01-02', users: 168 },
  { date: '2024-01-03', users: 156 },
  { date: '2024-01-04', users: 189 },
  { date: '2024-01-05', users: 234 },
  { date: '2024-01-06', users: 198 },
  { date: '2024-01-07', users: 176 },
  { date: '2024-01-08', users: 212 },
  { date: '2024-01-09', users: 245 },
  { date: '2024-01-10', users: 278 },
  { date: '2024-01-11', users: 256 },
  { date: '2024-01-12', users: 289 },
  { date: '2024-01-13', users: 312 },
  { date: '2024-01-14', users: 298 },
  { date: '2024-01-15', users: 334 },
];

export const testAttemptsByCategory = [
  { category: 'SSC Constable', attempts: 4520 },
  { category: 'Railway NTPC', attempts: 3890 },
  { category: 'Banking PO', attempts: 3245 },
  { category: 'NEET', attempts: 2980 },
  { category: 'JEE Main', attempts: 2560 },
  { category: 'SSC GD', attempts: 2340 },
  { category: 'UPSC CSAT', attempts: 1890 },
  { category: 'State PSC', attempts: 1120 },
];

export const subscriptionDistribution = [
  { name: 'Category-Specific', value: 65, fill: 'hsl(var(--chart-1))' },
  { name: 'All Categories', value: 35, fill: 'hsl(var(--chart-2))' },
];

export const recentUsers = [
  { name: 'Aditya Verma', phone: '+91 99887 76655', registeredOn: '2024-01-18 09:45:00', status: 'Active' },
  { name: 'Pooja Sharma', phone: '+91 88776 65544', registeredOn: '2024-01-18 09:30:00', status: 'Active' },
  { name: 'Ravi Kumar', phone: '+91 77665 54433', registeredOn: '2024-01-18 09:15:00', status: 'Active' },
  { name: 'Anita Singh', phone: '+91 66554 43322', registeredOn: '2024-01-18 09:00:00', status: 'Active' },
  { name: 'Suresh Patel', phone: '+91 55443 32211', registeredOn: '2024-01-18 08:45:00', status: 'Pending' },
  { name: 'Meera Reddy', phone: '+91 44332 21100', registeredOn: '2024-01-17 18:30:00', status: 'Active' },
  { name: 'Karan Malhotra', phone: '+91 33221 10099', registeredOn: '2024-01-17 17:45:00', status: 'Active' },
  { name: 'Divya Gupta', phone: '+91 22110 09988', registeredOn: '2024-01-17 16:30:00', status: 'Active' },
];

export const monthlyRevenue = [
  { month: 'Feb', revenue: 185000 },
  { month: 'Mar', revenue: 210000 },
  { month: 'Apr', revenue: 195000 },
  { month: 'May', revenue: 245000 },
  { month: 'Jun', revenue: 278000 },
  { month: 'Jul', revenue: 312000 },
  { month: 'Aug', revenue: 298000 },
  { month: 'Sep', revenue: 345000 },
  { month: 'Oct', revenue: 389000 },
  { month: 'Nov', revenue: 412000 },
  { month: 'Dec', revenue: 478000 },
  { month: 'Jan', revenue: 534000 },
];
