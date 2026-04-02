import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ---------------------------------------------------------------------------
  // CATEGORY
  // ---------------------------------------------------------------------------
  const category = await prisma.category.upsert({
    where: { slug: "tech" },
    update: {},
    create: {
      name: "Tech",
      slug: "tech",
      description: "Digital skills, coding, and technology fundamentals",
      icon: "💻",
    },
  });

  console.log("✅ Category:", category.name);

  // ---------------------------------------------------------------------------
  // INSTRUCTOR (admin user)
  // ---------------------------------------------------------------------------
  const hashedPassword = bcrypt.hashSync("Password123!", 10);

  const instructor = await prisma.user.upsert({
    where: { email: "instructor@growteens.com" },
    update: {},
    create: {
      firstName: "Ada",
      lastName: "Okafor",
      email: "instructor@growteens.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      bio: "Software engineer and educator with 10 years of experience teaching teens.",
    },
  });

  console.log("✅ Instructor:", instructor.firstName, instructor.lastName);

  // ---------------------------------------------------------------------------
  // TEST STUDENT
  // ---------------------------------------------------------------------------
  const student = await prisma.user.upsert({
    where: { email: "student@growteens.com" },
    update: {},
    create: {
      firstName: "Emeka",
      lastName: "Nwosu",
      email: "student@growteens.com",
      password: hashedPassword,
      role: "TEEN",
      age: 16,
      emailVerified: true,
      bio: "Aspiring developer from Lagos.",
    },
  });

  console.log("✅ Student:", student.firstName, student.lastName);

  // ---------------------------------------------------------------------------
  // COURSE
  // ---------------------------------------------------------------------------
  const course = await prisma.course.upsert({
    where: { slug: "intro-to-web-development" },
    update: {},
    create: {
      title: "Introduction to Web Development",
      slug: "intro-to-web-development",
      description:
        "Learn the fundamentals of building websites from scratch. This course covers HTML, CSS, and JavaScript — the three core technologies of the web. By the end, you will have built and deployed your own personal website.",
      thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800",
      categoryId: category.id,
      instructorId: instructor.id,
      difficulty: "BEGINNER",
      durationHours: 12,
      isFeatured: true,
      isPublished: true,
      tags: ["html", "css", "javascript", "web", "beginner"],
      outcomes: [
        "Build and structure web pages using HTML5",
        "Style pages with CSS including flexbox and responsive design",
        "Add interactivity with JavaScript basics",
        "Deploy a personal website to the internet",
      ],
      requirements: [
        "A computer with internet access",
        "No prior coding experience needed",
      ],
    },
  });

  console.log("✅ Course:", course.title);

  // ---------------------------------------------------------------------------
  // PROGRAM
  // ---------------------------------------------------------------------------
  const program = await prisma.program.upsert({
    where: { slug: "digital-skills-starter" },
    update: {},
    create: {
      title: "Digital Skills Starter",
      slug: "digital-skills-starter",
      description:
        "A curated learning path for teens who are new to technology. Start with web basics and build up to real projects.",
      isPublished: true,
      courses: {
        create: {
          courseId: course.id,
          orderNumber: 1,
        },
      },
    },
  });

  console.log("✅ Program:", program.title);

  // ---------------------------------------------------------------------------
  // MODULE 1 — HTML Fundamentals
  // ---------------------------------------------------------------------------
  const module1 = await prisma.courseModule.upsert({
    where: { courseId_orderNumber: { courseId: course.id, orderNumber: 1 } },
    update: {},
    create: {
      courseId: course.id,
      title: "HTML Fundamentals",
      description:
        "Learn the building blocks of every webpage. HTML (HyperText Markup Language) defines the structure and content of web pages.",
      orderNumber: 1,
      isPublished: true,
      estimatedHours: 3,
    },
  });

  await prisma.contentUnit.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: module1.id,
        title: "What is HTML?",
        contentType: "VIDEO",
        orderNumber: 1,
        estimatedMinutes: 8,
        isRequired: true,
        content: "https://www.youtube.com/watch?v=UB1O30fR-EE",
        description: "A quick overview of what HTML is and why it matters.",
      },
      {
        moduleId: module1.id,
        title: "HTML Document Structure",
        contentType: "TEXT",
        orderNumber: 2,
        estimatedMinutes: 15,
        isRequired: true,
        content: `# HTML Document Structure

Every HTML page has the same basic skeleton:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first webpage.</p>
  </body>
</html>
\`\`\`

- **\`<!DOCTYPE html>\`** — tells the browser this is an HTML5 document
- **\`<head>\`** — metadata, title, links to CSS
- **\`<body>\`** — everything visible on the page

## Common Tags

| Tag | Purpose |
|-----|---------|
| \`<h1>\`–\`<h6>\` | Headings |
| \`<p>\` | Paragraph |
| \`<a href="">\` | Link |
| \`<img src="" alt="">\` | Image |
| \`<ul>\` / \`<ol>\` | Lists |
| \`<div>\` | Generic container |
`,
      },
      {
        moduleId: module1.id,
        title: "Build Your First HTML Page",
        contentType: "ASSIGNMENT",
        orderNumber: 3,
        estimatedMinutes: 30,
        isRequired: true,
        content:
          "Create an HTML page about yourself. Include a heading with your name, a short paragraph bio, a list of 3 things you enjoy, and one image.",
      },
    ],
  });

  // Quiz for Module 1
  const quiz1 = await prisma.quiz.create({
    data: {
      moduleId: module1.id,
      title: "HTML Fundamentals Quiz",
      description: "Test your understanding of basic HTML concepts.",
      passingScore: 70,
      allowRetakes: true,
      orderNumber: 1,
      isPublished: true,
      showCorrectAnswers: true,
      questions: {
        create: [
          {
            questionText: "What does HTML stand for?",
            questionType: "SINGLE_CHOICE",
            points: 1,
            orderNumber: 1,
            options: JSON.stringify([
              "Hyper Text Markup Language",
              "High Tech Modern Language",
              "HyperTransfer Markup Logic",
              "Home Tool Markup Language",
            ]),
            correctAnswer: "Hyper Text Markup Language",
            explanation:
              "HTML stands for HyperText Markup Language — the standard language for creating web pages.",
          },
          {
            questionText:
              "Which tag is used to create the largest heading on a page?",
            questionType: "SINGLE_CHOICE",
            points: 1,
            orderNumber: 2,
            options: JSON.stringify(["<h6>", "<heading>", "<h1>", "<head>"]),
            correctAnswer: "<h1>",
            explanation:
              "<h1> is the largest heading. Headings go from <h1> (largest) to <h6> (smallest).",
          },
          {
            questionText: "The <head> tag contains content visible on the page.",
            questionType: "TRUE_FALSE",
            points: 1,
            orderNumber: 3,
            options: JSON.stringify(["True", "False"]),
            correctAnswer: "False",
            explanation:
              "The <head> contains metadata (title, charset, CSS links). Visible content goes inside <body>.",
          },
          {
            questionText:
              "Which attribute is required on an <img> tag for accessibility?",
            questionType: "SINGLE_CHOICE",
            points: 1,
            orderNumber: 4,
            options: JSON.stringify(["src", "alt", "href", "title"]),
            correctAnswer: "alt",
            explanation:
              "The `alt` attribute provides a text description of the image for screen readers and when images fail to load.",
          },
        ],
      },
    },
  });

  console.log("✅ Module 1 + Quiz:", module1.title);

  // ---------------------------------------------------------------------------
  // MODULE 2 — CSS Styling
  // ---------------------------------------------------------------------------
  const module2 = await prisma.courseModule.upsert({
    where: { courseId_orderNumber: { courseId: course.id, orderNumber: 2 } },
    update: {},
    create: {
      courseId: course.id,
      title: "Styling with CSS",
      description:
        "CSS (Cascading Style Sheets) controls the visual appearance of your HTML. Learn colours, fonts, spacing, and responsive layouts.",
      orderNumber: 2,
      isPublished: true,
      estimatedHours: 4,
    },
  });

  await prisma.contentUnit.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: module2.id,
        title: "CSS Basics — Selectors & Properties",
        contentType: "VIDEO",
        orderNumber: 1,
        estimatedMinutes: 12,
        isRequired: true,
        content: "https://www.youtube.com/watch?v=yfoY53QXEnI",
        description: "Learn how to target HTML elements and apply styles.",
      },
      {
        moduleId: module2.id,
        title: "The Box Model",
        contentType: "TEXT",
        orderNumber: 2,
        estimatedMinutes: 20,
        isRequired: true,
        content: `# The CSS Box Model

Every HTML element is a rectangular box made up of four layers:

\`\`\`
┌─────────────────────────┐
│         Margin          │
│  ┌───────────────────┐  │
│  │      Border       │  │
│  │  ┌─────────────┐  │  │
│  │  │   Padding   │  │  │
│  │  │  ┌───────┐  │  │  │
│  │  │  │Content│  │  │  │
│  │  │  └───────┘  │  │  │
│  │  └─────────────┘  │  │
│  └───────────────────┘  │
└─────────────────────────┘
\`\`\`

\`\`\`css
.card {
  width: 300px;         /* content width */
  padding: 20px;        /* space inside the border */
  border: 2px solid #ccc;
  margin: 16px;         /* space outside the border */
  border-radius: 8px;
  background-color: white;
}
\`\`\`

## Flexbox Layout

\`\`\`css
.container {
  display: flex;
  justify-content: center;   /* horizontal alignment */
  align-items: center;       /* vertical alignment */
  gap: 16px;
}
\`\`\`
`,
      },
      {
        moduleId: module2.id,
        title: "Responsive Design with Media Queries",
        contentType: "VIDEO",
        orderNumber: 3,
        estimatedMinutes: 15,
        isRequired: true,
        content: "https://www.youtube.com/watch?v=2KL-z9A56SQ",
        description:
          "Make your website look great on phones, tablets, and desktops.",
      },
      {
        moduleId: module2.id,
        title: "Style Your HTML Page",
        contentType: "ASSIGNMENT",
        orderNumber: 4,
        estimatedMinutes: 45,
        isRequired: true,
        content:
          "Take the HTML page you built in Module 1 and add a CSS stylesheet. Requirements: custom font and colour scheme, flexbox for layout, at least one media query for mobile.",
      },
    ],
  });

  const exercise1 = await prisma.exercise.create({
    data: {
      moduleId: module2.id,
      title: "CSS Card Component",
      description: "Build a profile card component using HTML and CSS.",
      instructions: `Create a profile card that includes:
1. A circular avatar image
2. A name and short bio
3. Three skill tags styled as badges
4. A "Connect" button with a hover effect

Submit a link to your CodePen or uploaded HTML/CSS files.`,
      exerciseType: "FILE_UPLOAD",
      orderNumber: 1,
      maxScore: 100,
    },
  });

  console.log("✅ Module 2 + Exercise:", module2.title);

  // ---------------------------------------------------------------------------
  // MODULE 3 — JavaScript Basics
  // ---------------------------------------------------------------------------
  const module3 = await prisma.courseModule.upsert({
    where: { courseId_orderNumber: { courseId: course.id, orderNumber: 3 } },
    update: {},
    create: {
      courseId: course.id,
      title: "JavaScript Basics",
      description:
        "Add interactivity to your website. Learn variables, functions, DOM manipulation, and how to respond to user events.",
      orderNumber: 3,
      isPublished: true,
      estimatedHours: 5,
    },
  });

  await prisma.contentUnit.createMany({
    skipDuplicates: true,
    data: [
      {
        moduleId: module3.id,
        title: "Variables, Data Types & Operators",
        contentType: "VIDEO",
        orderNumber: 1,
        estimatedMinutes: 14,
        isRequired: true,
        content: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        description:
          "The core building blocks of JavaScript: storing and working with data.",
      },
      {
        moduleId: module3.id,
        title: "Functions & Control Flow",
        contentType: "TEXT",
        orderNumber: 2,
        estimatedMinutes: 25,
        isRequired: true,
        content: `# Functions & Control Flow

## Functions

Functions are reusable blocks of code.

\`\`\`js
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Emeka")); // Hello, Emeka!
\`\`\`

Arrow function shorthand:
\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## If / Else

\`\`\`js
const age = 16;

if (age >= 18) {
  console.log("Adult");
} else if (age >= 13) {
  console.log("Teenager");
} else {
  console.log("Child");
}
\`\`\`

## Loops

\`\`\`js
const skills = ["HTML", "CSS", "JavaScript"];

for (const skill of skills) {
  console.log("I know " + skill);
}
\`\`\`
`,
      },
      {
        moduleId: module3.id,
        title: "DOM Manipulation",
        contentType: "VIDEO",
        orderNumber: 3,
        estimatedMinutes: 18,
        isRequired: true,
        content: "https://www.youtube.com/watch?v=5fb2aPlgoys",
        description:
          "Use JavaScript to select elements, change content, and react to user clicks.",
      },
      {
        moduleId: module3.id,
        title: "JavaScript Cheatsheet",
        contentType: "RESOURCE",
        orderNumber: 4,
        estimatedMinutes: 5,
        isRequired: false,
        content: "https://htmlcheatsheet.com/js/",
        description: "Quick reference for JavaScript syntax.",
      },
      {
        moduleId: module3.id,
        title: "Build an Interactive Quiz App",
        contentType: "ASSIGNMENT",
        orderNumber: 5,
        estimatedMinutes: 60,
        isRequired: true,
        content:
          "Build a simple quiz app in JavaScript. It should show one question at a time, accept a user answer, show if it is correct, and display a final score at the end. Use at least 5 questions.",
      },
    ],
  });

  const quiz2 = await prisma.quiz.create({
    data: {
      moduleId: module3.id,
      title: "JavaScript Basics Quiz",
      description: "Check your understanding of core JavaScript concepts.",
      passingScore: 60,
      allowRetakes: true,
      maxAttempts: 3,
      orderNumber: 1,
      isPublished: true,
      showCorrectAnswers: true,
      questions: {
        create: [
          {
            questionText: "Which keyword declares a variable that cannot be reassigned?",
            questionType: "SINGLE_CHOICE",
            points: 1,
            orderNumber: 1,
            options: JSON.stringify(["var", "let", "const", "def"]),
            correctAnswer: "const",
            explanation:
              "`const` declares a variable whose binding cannot be reassigned. `let` and `var` can be reassigned.",
          },
          {
            questionText: "What will `console.log(typeof 42)` print?",
            questionType: "SINGLE_CHOICE",
            points: 1,
            orderNumber: 2,
            options: JSON.stringify(["int", "number", "integer", "42"]),
            correctAnswer: "number",
            explanation:
              "JavaScript has a `number` type for all numeric values (integers and floats).",
          },
          {
            questionText:
              "Which method selects an element by its id attribute?",
            questionType: "SINGLE_CHOICE",
            points: 1,
            orderNumber: 3,
            options: JSON.stringify([
              "document.getElement()",
              "document.querySelector()",
              "document.getElementById()",
              "document.findById()",
            ]),
            correctAnswer: "document.getElementById()",
            explanation:
              "`getElementById` returns the element with the matching id. `querySelector` also works with `#id` syntax.",
          },
          {
            questionText: "JavaScript can only run in web browsers.",
            questionType: "TRUE_FALSE",
            points: 1,
            orderNumber: 4,
            options: JSON.stringify(["True", "False"]),
            correctAnswer: "False",
            explanation:
              "JavaScript also runs on servers via Node.js, in mobile apps, desktop apps, and more.",
          },
          {
            questionText:
              "In one sentence, explain what a function is in programming.",
            questionType: "SHORT_ANSWER",
            points: 2,
            orderNumber: 5,
            explanation:
              "A function is a named, reusable block of code that performs a specific task when called.",
          },
        ],
      },
    },
  });

  console.log("✅ Module 3 + Quiz:", module3.title);

  // ---------------------------------------------------------------------------
  // ENROLL THE STUDENT & SEED SOME PROGRESS
  // ---------------------------------------------------------------------------
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      status: "ACTIVE",
      progressPercentage: 33,
      lastAccessedAt: new Date(),
    },
  });

  // Mark module 1 as completed
  await prisma.moduleProgress.upsert({
    where: {
      enrollmentId_moduleId: {
        enrollmentId: enrollment.id,
        moduleId: module1.id,
      },
    },
    update: {},
    create: {
      enrollmentId: enrollment.id,
      moduleId: module1.id,
      userId: student.id,
      completedAt: new Date(),
      progressPercentage: 100,
    },
  });

  console.log("✅ Enrollment + progress seeded for student");

  // ---------------------------------------------------------------------------
  // COURSE REVIEW
  // ---------------------------------------------------------------------------
  await prisma.courseReview.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      rating: 5,
      comment:
        "Really clear explanations! I built my first webpage in the first week. The assignments are challenging but very practical.",
      isPublished: true,
    },
  });

  console.log("✅ Course review seeded");

  // ---------------------------------------------------------------------------
  // DONE
  // ---------------------------------------------------------------------------
  console.log("\n🎉 Seed complete!\n");
  console.log("Test accounts (password: Password123!):");
  console.log("  Instructor → instructor@growteens.com");
  console.log("  Student    → student@growteens.com");
  console.log("\nCourse: Introduction to Web Development");
  console.log("  Module 1: HTML Fundamentals      (3 units + quiz)");
  console.log("  Module 2: Styling with CSS        (4 units + exercise)");
  console.log("  Module 3: JavaScript Basics       (5 units + quiz)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
