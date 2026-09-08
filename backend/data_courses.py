"""
Find Me - Expanded Verified Free Courses & Certifications Dataset
Covers approved Indian learning platforms (Skill India, NSDC, SWAYAM, NPTEL)
and major global enterprise certification portals (Google, Microsoft, IBM, AWS, Salesforce, Meta, Cisco, HubSpot, LinkedIn).
"""

from typing import List, Dict, Any

COURSES: List[Dict[str, Any]] = [
    # =========================================================================
    # 🇮🇳 INDIAN GOVERNMENT & NATIONAL SKILL PLATFORMS (SKILL INDIA, NSDC, SWAYAM, NPTEL)
    # =========================================================================
    {
        "id": "course-swayam-ds",
        "skill": "Data Analysis",
        "skills_improved": ["Data Analysis", "Python", "Statistical Modeling", "Research"],
        "title": "Data Science for Engineers (NPTEL / IIT Madras)",
        "provider": "SWAYAM & NPTEL (IIT Madras)",
        "provider_logo": "🇮🇳",
        "provider_category": "Indian Government & NPTEL",
        "duration": "8 weeks (Self-paced + weekly assignments)",
        "level": "Beginner to Intermediate",
        "eligibility": "Open to all students enrolled in Indian and global universities",
        "free_details": "100% Free full course access, lecture videos, and interactive problem sets; Govt of India accredited",
        "enrollment_url": "https://swayam.gov.in/explorer?category=Computer_Science_and_Engineering",
        "description": "Taught by IIT Madras faculty covering linear algebra for data science, regression algorithms, R programming, and data-driven engineering decision making."
    },
    {
        "id": "course-skillindia-ai",
        "skill": "Artificial Intelligence",
        "skills_improved": ["Artificial Intelligence", "Machine Learning", "Python", "Ethics in AI"],
        "title": "AI for All - Emerging Technologies Certification",
        "provider": "Skill India Digital Hub / NSDC",
        "provider_logo": "🇮🇳",
        "provider_category": "Skill India & NSDC",
        "duration": "4 hours (Self-paced modular track)",
        "level": "Beginner",
        "eligibility": "Open to all Indian citizens and students (No prerequisites)",
        "free_details": "100% Free official Skill India & NSDC verifiable digital badge and certificate",
        "enrollment_url": "https://www.skillindiadigital.gov.in/",
        "description": "National initiative under Skill India introducing fundamental AI principles, machine intelligence, natural language processing, and digital public infrastructure."
    },
    {
        "id": "course-nptel-cloud",
        "skill": "Cloud Computing",
        "skills_improved": ["Cloud Computing", "Distributed Systems", "Virtualization", "AWS/Azure concepts"],
        "title": "Cloud Computing & Distributed Architecture (IIT Kharagpur)",
        "provider": "NPTEL / SWAYAM (IIT Kharagpur)",
        "provider_logo": "🇮🇳",
        "provider_category": "Indian Government & NPTEL",
        "duration": "8 weeks (3-4 hrs/week)",
        "level": "Intermediate",
        "eligibility": "Undergraduate and postgraduate students in technical disciplines",
        "free_details": "100% Free course access, hands-on tutorials, and official IIT course syllabus",
        "enrollment_url": "https://nptel.ac.in/courses",
        "description": "Comprehensive study of cloud service models (IaaS, PaaS, SaaS), cloud storage scalability, edge computing, and containerization by IIT Kharagpur faculty."
    },
    {
        "id": "course-nsdc-cyber",
        "skill": "Cybersecurity",
        "skills_improved": ["Cybersecurity", "Network Defence", "Incident Response", "Vulnerability Assessment"],
        "title": "Cyber Security Fundamentals - National Qualification",
        "provider": "National Skill Development Corporation (NSDC) / Skill India",
        "provider_logo": "🛡️",
        "provider_category": "Skill India & NSDC",
        "duration": "20 hours (Self-paced + labs)",
        "level": "Beginner to Intermediate",
        "eligibility": "Students interested in cyber defense, digital governance, and IT roles",
        "free_details": "100% Free access with official NSDC completion certificate",
        "enrollment_url": "https://www.skillindiadigital.gov.in/",
        "description": "Aligned with the National Skills Qualifications Framework (NSQF). Covers malware analysis, threat mitigation, data privacy laws, and IT Act compliance."
    },
    {
        "id": "course-swayam-finance",
        "skill": "Financial Modeling",
        "skills_improved": ["Financial Modeling", "Banking Operations", "Securities Markets", "Econometrics"],
        "title": "Indian Financial System & Capital Markets",
        "provider": "SWAYAM (IIM Bangalore / Central Universities)",
        "provider_logo": "📊",
        "provider_category": "Indian Government & NPTEL",
        "duration": "12 weeks (3 hrs/week)",
        "level": "Intermediate",
        "eligibility": "Commerce, Economics, Engineering, and Management students",
        "free_details": "100% Free study materials, reading guides, and video lectures",
        "enrollment_url": "https://swayam.gov.in/explorer?category=Management_Studies",
        "description": "Detailed exploration of RBI banking frameworks, SEBI capital market regulations, debt instruments, mutual funds, and derivative financial structures."
    },

    # =========================================================================
    # 🌐 GLOBAL TECH ENTERPRISES (GOOGLE, MICROSOFT, IBM, AWS, SALESFORCE, META, CISCO)
    # =========================================================================
    {
        "id": "course-google-genai",
        "skill": "Machine Learning",
        "skills_improved": ["Machine Learning", "Generative AI", "Large Language Models", "Python"],
        "title": "Introduction to Generative AI & LLMs Learning Path",
        "provider": "Google Cloud Skills Boost",
        "provider_logo": "🌐",
        "provider_category": "Google",
        "duration": "8 hours (Hands-on Labs)",
        "level": "Beginner",
        "eligibility": "Open to developers and students worldwide",
        "free_details": "100% Free with official Google Cloud Skill Badges for your resume/LinkedIn",
        "enrollment_url": "https://www.cloudskillsboost.google/paths/118",
        "description": "Learn what Generative AI is, how foundation models and Transformer architectures operate, and how to apply Responsible AI principles."
    },
    {
        "id": "course-ms-azure-fund",
        "skill": "Cloud Computing",
        "skills_improved": ["Cloud Computing", "Azure Architecture", "DevOps", "Infrastructure Security"],
        "title": "Microsoft Azure Fundamentals (AZ-900) Official Learning Path",
        "provider": "Microsoft Learn",
        "provider_logo": "🟦",
        "provider_category": "Microsoft",
        "duration": "9 hours (Interactive browser sandboxes)",
        "level": "Beginner",
        "eligibility": "Anyone wanting to master enterprise cloud concepts",
        "free_details": "100% Free interactive browser sandboxes, video modules, and Microsoft achievement badges",
        "enrollment_url": "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals-describe-azure-architecture-services/",
        "description": "Master core cloud architectural components, computing, networking, storage services, identity governance, and pricing models directly from Microsoft."
    },
    {
        "id": "course-ibm-ai",
        "skill": "Artificial Intelligence",
        "skills_improved": ["Artificial Intelligence", "Machine Learning", "Data Ethics", "Chatbots"],
        "title": "Artificial Intelligence Fundamentals & Digital Credentials",
        "provider": "IBM SkillsBuild",
        "provider_logo": "🔷",
        "provider_category": "IBM",
        "duration": "10 hours (Self-paced)",
        "level": "Beginner",
        "eligibility": "Students and early career professionals worldwide",
        "free_details": "100% Free with verified IBM digital badge via Credly",
        "enrollment_url": "https://skillsbuild.org/students",
        "description": "Gain a solid grounding in machine learning, natural language processing, computer vision, and cognitive computing from IBM research scientists."
    },
    {
        "id": "course-aws-cloud-ess",
        "skill": "Cloud Computing",
        "skills_improved": ["Cloud Computing", "AWS Services", "Cloud Architecture", "Database Management"],
        "title": "AWS Cloud Practitioner Essentials",
        "provider": "AWS Skill Builder (Amazon Web Services)",
        "provider_logo": "☁️",
        "provider_category": "AWS",
        "duration": "6 hours (Interactive video & scenarios)",
        "level": "Beginner",
        "eligibility": "Open to all students and career seekers",
        "free_details": "100% Free official digital training course from AWS",
        "enrollment_url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials",
        "description": "Understand overall AWS Cloud concepts, compute (EC2, Lambda), storage (S3, EBS), security, database engines (RDS, DynamoDB), and compliance."
    },
    {
        "id": "course-salesforce-admin",
        "skill": "Project Management",
        "skills_improved": ["Project Management", "CRM Workflows", "Business Analytics", "Salesforce Automation"],
        "title": "Build Your Tech Career with Salesforce Trailhead",
        "provider": "Salesforce Trailhead",
        "provider_logo": "☁️",
        "provider_category": "Salesforce",
        "duration": "15 hours (Interactive Trailmix)",
        "level": "Beginner",
        "eligibility": "Free for anyone creating a Trailhead account",
        "free_details": "100% Free interactive hands-on developer sandboxes, badges, and Superbadges",
        "enrollment_url": "https://trailhead.salesforce.com/",
        "description": "Build cloud business apps, configure data security, automate business workflows with Flow Builder, and create real-time analytics reports."
    },
    {
        "id": "course-meta-react",
        "skill": "Web Development",
        "skills_improved": ["Web Development", "JavaScript", "React", "Frontend Architecture"],
        "title": "React Basics & Modern Web Development",
        "provider": "Meta / Coursera",
        "provider_logo": "♾️",
        "provider_category": "Meta",
        "duration": "26 hours (Self-paced)",
        "level": "Beginner to Intermediate",
        "eligibility": "Familiarity with basic HTML and JavaScript recommended",
        "free_details": "Free full course audit (lecture videos, readings, community forums)",
        "enrollment_url": "https://www.coursera.org/learn/react-basics",
        "description": "Learn React component architecture, props, state, hooks, event handling, and modern responsive UI development directly from Meta software engineers."
    },
    {
        "id": "course-cisco-cyber",
        "skill": "Cybersecurity",
        "skills_improved": ["Cybersecurity", "Network Security", "Threat Detection", "Privacy"],
        "title": "Introduction to Cybersecurity & Digital Safety",
        "provider": "Cisco Networking Academy",
        "provider_logo": "🔒",
        "provider_category": "Cisco",
        "duration": "15 hours (Self-paced + quizzes)",
        "level": "Beginner",
        "eligibility": "Open globally to students and self-learners",
        "free_details": "100% Free with official Cisco digital badge and certificate of completion",
        "enrollment_url": "https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity",
        "description": "Learn how to defend networks against malware, social engineering, denial-of-service attacks, and protect organizational confidentiality."
    },
    {
        "id": "course-hubspot-inbound",
        "skill": "Communication",
        "skills_improved": ["Communication", "Digital Marketing", "Content Strategy", "Customer Growth"],
        "title": "Inbound Marketing & Growth Strategy Certification",
        "provider": "HubSpot Academy",
        "provider_logo": "📈",
        "provider_category": "HubSpot",
        "duration": "5 hours (Comprehensive video track)",
        "level": "Beginner",
        "eligibility": "Open to all students and marketing professionals",
        "free_details": "100% Free verified certification badge for your LinkedIn profile and resume",
        "enrollment_url": "https://academy.hubspot.com/courses/inbound-marketing",
        "description": "Master content creation, social media promotion, lead nurturing, search engine optimization, and conversational growth."
    },
    {
        "id": "course-linkedin-swe",
        "skill": "Software Engineering",
        "skills_improved": ["Software Engineering", "Algorithms", "Git", "System Design"],
        "title": "Career Essentials in Software Development",
        "provider": "Microsoft & LinkedIn Learning (Opportunity Initiative)",
        "provider_logo": "💼",
        "provider_category": "LinkedIn Learning",
        "duration": "14 hours (Learning Path)",
        "level": "Beginner to Intermediate",
        "eligibility": "Free through the global Microsoft/LinkedIn skilling initiative",
        "free_details": "100% Free access with official Professional Certificate on LinkedIn",
        "enrollment_url": "https://opportunity.linkedin.com/skills-for-in-demand-jobs",
        "description": "Learn the core programming languages, software life cycle concepts, database fundamentals, and interview preparation for junior engineers."
    },

    # =========================================================================
    # 🏛️ TRUSTED OPEN COURSEWARE & FOUNDATIONS
    # =========================================================================
    {
        "id": "course-fcc-python",
        "skill": "Python",
        "skills_improved": ["Python", "Scientific Computing", "Data Structures", "Algorithms"],
        "title": "Scientific Computing with Python Certification",
        "provider": "freeCodeCamp",
        "provider_logo": "🔥",
        "provider_category": "freeCodeCamp",
        "duration": "300 hours (Self-paced projects)",
        "level": "Beginner to Intermediate",
        "eligibility": "Free to all students worldwide",
        "free_details": "100% Free with verified digital certificate & 5 portfolio projects",
        "enrollment_url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        "description": "Master Python fundamentals, loops, data structures, algorithm efficiency, and complete 5 production projects."
    },
    {
        "id": "course-mit-cpp",
        "skill": "C++",
        "skills_improved": ["C++", "Memory Management", "Object-Oriented Design", "Algorithms"],
        "title": "Introduction to C++ and Object-Oriented Design",
        "provider": "MIT OpenCourseWare",
        "provider_logo": "🏛️",
        "provider_category": "MIT OpenCourseWare",
        "duration": "6 weeks (Self-paced)",
        "level": "Intermediate",
        "eligibility": "Free public access worldwide",
        "free_details": "100% Free complete MIT lecture notes, assignments, and solution keys",
        "enrollment_url": "https://ocw.mit.edu/courses/6-096-introduction-to-c-january-iap-2011/",
        "description": "Rigorous introduction to C++ syntax, pointers, memory allocation, object-oriented principles, and standard template library (STL)."
    },
    {
        "id": "course-khan-stats",
        "skill": "Statistics",
        "skills_improved": ["Statistics", "Probability", "Hypothesis Testing", "Data Analysis"],
        "title": "College Statistics and Probability Mastery",
        "provider": "Khan Academy",
        "provider_logo": "📗",
        "provider_category": "Khan Academy",
        "duration": "40 hours (Interactive Mastery)",
        "level": "Beginner to Intermediate",
        "eligibility": "Free forever for all learners",
        "free_details": "100% Free personalized interactive practice exercises, hints, and quizzes",
        "enrollment_url": "https://www.khanacademy.org/math/statistics-probability",
        "description": "Master random variables, normal distributions, sampling distributions, confidence intervals, p-values, and linear regressions."
    }
]
