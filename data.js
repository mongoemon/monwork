const mockData = {
    profile: [
        {
            Name: "John Doe",
            Bio: "สวัสดีครับ ผมเป็นนักพัฒนาเว็บที่มีประสบการณ์ 5 ปี",
            Age: "30",
            Photo_URL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9maWxlPC90ZXh0Pjwvc3ZnPg==",
            Location: "กรุงเทพฯ",
            Hobbies: "เขียนโค้ด, อ่านหนังสือ"
        }
    ],
    projects: [
        {
            Project_Name: "Portfolio Website",
            Description: "เว็บแนะนำตัวเองและโปรเจค",
            Technologies: "HTML, CSS, JavaScript",
            GitHub_Link: "https://github.com/example/portfolio",
            Demo_Link: "https://example.com/demo",
            Image_URL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZWN0PC90ZXh0Pjwvc3ZnPg==",
            Date: "2024"
        },
        {
            Project_Name: "E-commerce App",
            Description: "แอปขายของออนไลน์สำหรับขายสินค้าทำมือ",
            Technologies: "React, Node.js, MongoDB",
            GitHub_Link: "https://github.com/example/ecommerce",
            Demo_Link: "https://example.com/demo2",
            Image_URL: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9qZWN0PC90ZXh0Pjwvc3ZnPg==",
            Date: "2023"
        }
    ],
    skills: [
        {
            Skill_Name: "Test Planning",
            Category: "QA",
            Level: "5",
            Description: "วางแผนการทดสอบและเขียน test case",
            Domain: "QA"
        },
        {
            Skill_Name: "Manual Testing",
            Category: "QA",
            Level: "5",
            Description: "ทดสอบซอฟต์แวร์ด้วยตนเอง",
            Domain: "QA"
        },
        {
            Skill_Name: "Bug Reporting",
            Category: "QA",
            Level: "4",
            Description: "รายงานและติดตาม bug ผ่านเครื่องมือ",
            Domain: "QA"
        },
        {
            Skill_Name: "Automation Testing",
            Category: "QA",
            Level: "3",
            Description: "เขียนสคริปต์ทดสอบอัตโนมัติ",
            Domain: "QA"
        },
        {
            Skill_Name: "JavaScript",
            Category: "Programming",
            Level: "5",
            Description: "ภาษาหลักสำหรับ frontend",
            Domain: "Software Development"
        },
        {
            Skill_Name: "React",
            Category: "Framework",
            Level: "4",
            Description: "สร้าง UI แบบ interactive",
            Domain: "Software Development"
        },
        {
            Skill_Name: "Python",
            Category: "Programming",
            Level: "3",
            Description: "สำหรับงาน backend และ scripting",
            Domain: "Software Development"
        }
    ],
    tools: [
        {
            Tool_Name: "JIRA",
            Category: "Test Management",
            Domain: "QA"
        },
        {
            Tool_Name: "TestRail",
            Category: "Test Management",
            Domain: "QA"
        },
        {
            Tool_Name: "Selenium",
            Category: "Automation",
            Domain: "QA"
        },
        {
            Tool_Name: "Postman",
            Category: "API Testing",
            Domain: "QA"
        },
        {
            Tool_Name: "JMeter",
            Category: "Performance",
            Domain: "QA"
        },
        {
            Tool_Name: "Charles Proxy",
            Category: "Device / Platform",
            Domain: "QA"
        },
        {
            Tool_Name: "Git",
            Category: "Version Control",
            Domain: "Software Development"
        },
        {
            Tool_Name: "VS Code",
            Category: "Collaboration",
            Domain: "Software Development"
        },
        {
            Tool_Name: "Docker",
            Category: "CI/CD",
            Domain: "Software Development"
        },
        {
            Tool_Name: "MongoDB",
            Category: "Database",
            Domain: "Software Development"
        },
        {
            Tool_Name: "Figma",
            Category: "Collaboration",
            Domain: "Software Development"
        }
    ],
    contact: [
        {
            Email: "john@example.com",
            Phone: "081-234-5678",
            LinkedIn_URL: "https://linkedin.com/in/johndoe",
            GitHub_URL: "https://github.com/johndoe"
        }
    ]
};
