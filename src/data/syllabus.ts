export type Unit = {
  title: string;
  lectures?: number;
  topics: string[];
  whyItMatters?: string;
  reading?: string;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  pdf: string;
  hours: string;
  credits: number;
  examSplit: {
    internal: string;
    endTerm: string;
    note?: string;
  };
  isLabHeavy: boolean;
  roadmapText: string;
  units: Unit[];
  cheatSheets: string[];
  practiceTopics: string[];
  labs: string[];
  projects: string[];
  books: {
    title: string;
    author: string;
    isPrimary?: boolean;
    isBeginnerFriendly?: boolean;
    note?: string;
  }[];
};

export const syllabusData: Subject[] = [
  {
    id: "csu083",
    code: "CSU083",
    name: "Analysis and Design of Algorithms",
    pdf: "https://forxosuabfvmqeftkdqf.supabase.co/storage/v1/object/public/resources/Analysis%20and%20Design%20of%20Algorithms.pdf",
    hours: "3+0+1",
    credits: 4,
    isLabHeavy: false,
    examSplit: {
      internal: "50% (Assignments 8, Quizzes 7, Practicals 8, Attendance 5, Midterm 12, Viva 10)",
      endTerm: "50%",
      note: "Heavier final than the others, worth flagging loudly."
    },
    roadmapText: "Learn how to measure and optimize code performance. By the end, you'll be able to compare algorithms and choose the most efficient one for any problem.",
    units: [
      {
        title: "Unit 1: Foundations",
        topics: [
          "Growth of functions, Asymptotic notation",
          "Linear-time sorting (counting/radix/bucket)",
          "Order statistics",
          "Disjoint sets"
        ],
        whyItMatters: "Forms the mathematical basis for proving your code isn't slow.",
        reading: "CLRS Chapters 2-4, 8, 9, 21"
      },
      {
        title: "Unit 2: DP & Greedy",
        topics: [
          "Matrix chain multiplication",
          "Strassen's algorithm",
          "Longest Common Subsequence (LCS)",
          "Optimal BST",
          "Greedy vs DP",
          "Knapsack, Huffman coding"
        ],
        whyItMatters: "The core of modern technical interviews and optimization problems.",
        reading: "CLRS Chapters 15, 16"
      },
      {
        title: "Unit 3: Graphs",
        topics: [
          "Representation, BFS/DFS, Topological sort, SCC",
          "Kruskal & Prim (MST)",
          "Dijkstra, Bellman-Ford",
          "All-pairs shortest paths / Floyd-Warshall"
        ],
        whyItMatters: "Powers maps, networks, and dependency resolution.",
        reading: "CLRS Chapters 22-25"
      },
      {
        title: "Unit 4: String Matching",
        topics: [
          "Naive string matching",
          "Rabin-Karp algorithm",
          "Finite automata",
          "Knuth-Morris-Pratt (KMP)"
        ],
        whyItMatters: "How search engines and text editors find things instantly.",
        reading: "CLRS Chapter 32"
      }
    ],
    cheatSheets: [
      "Complexity table (Best/Avg/Worst/Space)",
      "Big-O/Ω/Θ definitions",
      "Greedy vs DP decision tree",
      "Master theorem for recurrences"
    ],
    practiceTopics: [
      "Solve recurrences",
      "Fill the DP table for LCS/Knapsack",
      "Dry-run Dijkstra/Prim/Kruskal on a graph",
      "Build the KMP failure function"
    ],
    labs: [
      "Recursive/binary search",
      "Heap/merge/insertion/quick/selection sort",
      "Binomial coefficient via DP",
      "DFS/BFS traversal",
      "Kruskal/Prim MST",
      "Dijkstra shortest path",
      "Warshall transitive closure",
      "Floyd all-pairs shortest path",
      "String matching algorithms"
    ],
    projects: [],
    books: [
      {
        title: "Introduction to Algorithms (CLRS)",
        author: "Cormen, Leiserson, Rivest, Stein",
        isPrimary: true,
        note: "Lecture plan references this page-by-page. Make it the default."
      },
      {
        title: "Fundamentals of Computer Algorithms",
        author: "Horowitz & Sahani"
      },
      {
        title: "The Design and Analysis of Computer Algorithms",
        author: "Aho, Hopcroft, Ullman"
      }
    ]
  },
  {
    id: "csu357",
    code: "CSU357",
    name: "Database Management System",
    pdf: "https://forxosuabfvmqeftkdqf.supabase.co/storage/v1/object/public/resources/Database%20Management%20System.pdf",
    hours: "2+0+1",
    credits: 3,
    isLabHeavy: true,
    examSplit: {
      internal: "70% (Assignments 20, Quizzes 10, Practicals 15, Attendance 5, Midterm 10, Viva 10)",
      endTerm: "30%"
    },
    roadmapText: "Understand how data is stored, retrieved, and protected from corruption. You'll design schemas, write SQL, and grasp the mechanics of transactions.",
    units: [
      {
        title: "Unit 1: Introduction to Database System",
        topics: [
          "DB vs DBMS",
          "Architecture, Users/roles",
          "Schemas & instances, Data models",
          "Data independence",
          "Advantages/disadvantages"
        ],
        whyItMatters: "Sets the stage for why we don't just use Excel files.",
        reading: "Elmasri & Navathe Ch 1-2"
      },
      {
        title: "Unit 2: ER Modeling",
        topics: [
          "Entities/attributes/relationships",
          "Keys, ER diagrams",
          "Weak entities, Generalization/aggregation",
          "CODD's 12 rules"
        ],
        whyItMatters: "How to translate real-world requirements into a data blueprint.",
        reading: "Elmasri & Navathe Ch 3, 7"
      },
      {
        title: "Unit 3: Relational Model & SQL",
        topics: [
          "Relational algebra & calculus",
          "Basic/nested queries, Aggregates, NULLs",
          "Joins, Outer joins",
          "Integrity constraints"
        ],
        whyItMatters: "The universal language for talking to databases.",
        reading: "Elmasri & Navathe Ch 4-5"
      },
      {
        title: "Unit 4: Database Design",
        topics: [
          "Schema refinement, Anomalies",
          "Functional dependencies",
          "1NF→BCNF, Lossless join",
          "Dependency preservation, MVDs, 4NF/5NF"
        ],
        whyItMatters: "Prevents data duplication and massive update headaches.",
        reading: "Elmasri & Navathe Ch 14-15"
      },
      {
        title: "Unit 5: Transactions & Concurrency",
        topics: [
          "ACID properties",
          "Schedules, Serializability",
          "Locking, Timestamps, Deadlock",
          "Recovery, Shadow paging"
        ],
        whyItMatters: "Ensures the bank doesn't lose your money when the power goes out.",
        reading: "Elmasri & Navathe Ch 20-22"
      }
    ],
    cheatSheets: [
      "SQL command reference (DDL/DML/DCL)",
      "Join types diagram",
      "Normalization ladder (1NF→5NF with examples)",
      "ACID in one line each",
      "Relational algebra symbols"
    ],
    practiceTopics: [
      "Draw the ER diagram for X",
      "Normalize this table to 3NF/BCNF",
      "Write SQL for this query",
      "Find candidate keys / functional-dependency closure",
      "Is this schedule serializable?"
    ],
    labs: [
      "DDL commands (CREATE, ALTER, DROP)",
      "DML commands (INSERT, UPDATE, DELETE)",
      "GROUP functions and HAVING",
      "Set operators",
      "Integrity constraints & Foreign keys",
      "Joins (Inner, Outer, Cross)"
    ],
    projects: [
      "Healthcare DB",
      "Restaurant Mgmt",
      "Blood Donation System",
      "School Mgmt",
      "Salary Mgmt",
      "ATM",
      "Quiz System",
      "E-commerce",
      "Builders' recordkeeping"
    ],
    books: [
      {
        title: "Fundamentals of Database Systems",
        author: "Elmasri & Navathe",
        isPrimary: true,
        note: "Your lecture plan keys everything to this book's page numbers."
      },
      {
        title: "Database Management Systems",
        author: "Ramakrishnan & Gehrke"
      },
      {
        title: "Database System Concepts",
        author: "Silberschatz, Korth, Sudarshan"
      }
    ]
  },
  {
    id: "csu2215",
    code: "CSU2215",
    name: "Introduction to Git and Github",
    pdf: "https://forxosuabfvmqeftkdqf.supabase.co/storage/v1/object/public/resources/Introduction%20to%20Git%20and%20Github.pdf",
    hours: "3+0+0",
    credits: 3,
    isLabHeavy: false,
    examSplit: {
      internal: "80% (Seminar 15, Discussion 10, Quizzes 10, Assignments 10, Attendance 5, Midterm...)",
      endTerm: "20%",
      note: "Grading numbers in syllabus don't add cleanly — verify split."
    },
    roadmapText: "Learn to track code history and collaborate without deleting your teammates' work. You'll master branching, merging, and open-source workflows.",
    units: [
      {
        title: "Unit A: VCS & Git Basics",
        topics: [
          "Centralized vs distributed",
          "Install/config, init",
          "The .git directory",
          "Staging/committing, status/log, diff, help"
        ],
        whyItMatters: "The absolute basics of saving your code history.",
        reading: "Pro Git Ch 1-2"
      },
      {
        title: "Unit B: Branching & Merging",
        topics: [
          "Create/switch/view branches",
          "Fast-forward vs three-way merge",
          "Conflict resolution, tags",
          "Rebasing, reset/revert/checkout"
        ],
        whyItMatters: "How multiple people work on the same file without crying.",
        reading: "Pro Git Ch 3"
      },
      {
        title: "Unit C: Remotes & GitHub",
        topics: [
          "GitHub account/repos",
          "Push, clone vs fork, pull",
          "Collaborators, SSH keys",
          ".gitignore, README, GitHub Pages"
        ],
        whyItMatters: "Putting your code in the cloud so others can see it.",
        reading: "Pro Git Ch 6"
      },
      {
        title: "Unit D: Collaboration Workflows",
        topics: [
          "Pull requests (create/review/merge)",
          "Issues & labels, Milestones/projects",
          "Open-source contribution",
          "Basic CI/CD, repo insights"
        ],
        whyItMatters: "How real software engineering teams operate day-to-day.",
        reading: "GitHub Docs"
      }
    ],
    cheatSheets: [
      "Everyday Git command card",
      "Branching commands",
      "Undo cheat sheet (reset vs revert vs checkout)",
      "Merge-conflict resolution steps",
      "PR workflow diagram"
    ],
    practiceTopics: [
      "Make your first PR (guided task)",
      "Collaborative class repo exercise",
      "Set up GitHub Pages"
    ],
    labs: [],
    projects: [
      "Host a personal portfolio on GitHub Pages",
      "Contribute to an open-source repo"
    ],
    books: [
      {
        title: "Pro Git",
        author: "Scott Chacon and Ben Straub",
        isPrimary: true,
        note: "Free online, directly answers everything."
      },
      {
        title: "Learning Git and GitHub",
        author: "Somasundaram"
      },
      {
        title: "GitHub Docs",
        author: "GitHub"
      }
    ]
  },
  {
    id: "csu1162",
    code: "CSU1162",
    name: "Python Application Programming",
    pdf: "https://forxosuabfvmqeftkdqf.supabase.co/storage/v1/object/public/resources/Python%20Application%20Programming.pdf",
    hours: "3+0+0",
    credits: 3,
    isLabHeavy: true,
    examSplit: {
      internal: "70% (Assignments 20, Quizzes 10, Practicals 15, Attendance 5, Midterm 10, Viva 10)",
      endTerm: "30%"
    },
    roadmapText: "From basic syntax to building real applications. You'll learn core Python, Object-Oriented design, and touch on web/data libraries.",
    units: [
      {
        title: "Unit A: Foundations",
        topics: [
          "History & setup",
          "Variables/types/operators",
          "Control flow",
          "Functions & modules, standard library"
        ],
        whyItMatters: "The syntax and building blocks of all Python scripts."
      },
      {
        title: "Unit B: Data, Files & Errors",
        topics: [
          "Lists/tuples/dicts",
          "Strings & regex",
          "File I/O",
          "Exception handling"
        ],
        whyItMatters: "How to process real information without your script crashing."
      },
      {
        title: "Unit C: OOP",
        topics: [
          "Classes & objects",
          "Inheritance, polymorphism",
          "Encapsulation, abstraction"
        ],
        whyItMatters: "Designing larger programs cleanly instead of using giant scripts."
      },
      {
        title: "Unit D: Libraries & Applications",
        topics: [
          "Flask/Django basics",
          "NumPy/pandas/Matplotlib",
          "DB access",
          "GUI (Tkinter)"
        ],
        whyItMatters: "Where Python becomes actually useful for the real world."
      }
    ],
    cheatSheets: [
      "Python data-type methods (str/list/dict)",
      "f-strings & formatting",
      "Regex quick reference",
      "try/except patterns",
      "OOP skeleton (class, __init__, inheritance)",
      "File modes (r/w/a/rb)"
    ],
    practiceTopics: [
      "Trace this loop output",
      "Write a function to solve X",
      "Dict/list comprehension conversions",
      "Design an OOP class system",
      "Exception-handling fill-ins"
    ],
    labs: [
      "Basic syntax & control flow",
      "Data structures operations",
      "File reading/writing",
      "Creating an OOP hierarchy",
      "Mini project (Web or Data)"
    ],
    projects: [
      "Web Scraper",
      "CLI To-Do list",
      "Data analysis with Pandas",
      "Simple Flask API"
    ],
    books: [
      {
        title: "Official Python Tutorial",
        author: "Python Software Foundation",
        isPrimary: true,
        isBeginnerFriendly: true,
        note: "Best starting point for absolute beginners."
      },
      {
        title: "Fluent Python",
        author: "Luciano Ramalho",
        note: "Intermediate - good for after basics."
      },
      {
        title: "Python Cookbook",
        author: "David Beazley & Brian K. Jones"
      }
    ]
  }
];
