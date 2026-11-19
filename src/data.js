// ====== EDIT YOUR CONTENT HERE ======
export const PROFILE = {
  name: 'DARSHAN MUTALIKDESAI',
  role: 'Frontend Developer · Full-Stack',
  fallbackUrl: 'https://darshanmutalikdesai.dev/',
}

// ZONES are the story chapters, IN MISSION ORDER (the player unlocks them one by one).
//   marker  = the glowing ring you drive / walk into (press E to read once unlocked)
//   bld     = building centre, size = [w, h, d]
//   mission = what the player must do to unlock this chapter. Types:
//     drive  -> arrive in the CAR            walk  -> arrive ON FOOT (press F to leave the car)
//     speed  -> reach `kmh` km/h in the car, then arrive
//     orbs   -> collect every glowing orb in `orbs` [x,z], then arrive
//     time   -> arrive before the `secs` countdown ends (it restarts if you run out)
//     any    -> just arrive
export const ZONES = [
  {
    id: 'about', title: 'ABOUT ME', color: '#ff4d6d', marker: [-35, -35], bld: [-62, -62], size: [34, 18, 26],
    mission: { type: 'drive', text: 'Welcome to the city! Drive your car into the glowing PINK ring.' },
    items: [
      { t: 'Darshan Mutalikdesai', d: 'Creative and detail-oriented Computer Science Engineering student specializing in Frontend Development, with hands-on experience building secure, responsive and accessible web applications using React.js, JavaScript and modern CSS frameworks.\n\nStrong in pixel-perfect UI, smooth animations and performance optimization, plus frontend security practices: secure authentication flows, protected routes, JWT-based API integration, and clean, scalable code architecture.' },
      { t: 'Education', d: 'Bachelor of Engineering in Computer Science\nKLS Gogte Institute of Technology, Belagavi · Expected graduation 2026\n\nCoursework: Data Structures, Algorithms, DBMS, OOP, Software Engineering, Web Technologies' },
    ],
  },
  {
    id: 'skills', title: 'SKILLS', color: '#ffd24d', marker: [-35, 35], bld: [-62, 62], size: [34, 16, 26],
    mission: { type: 'walk', text: 'Press F to step out of the car, then WALK into the YELLOW ring on foot.' },
    items: [
      { t: 'Languages', d: 'JavaScript (ES6+), TypeScript, HTML5, CSS3, Python, SQL' },
      { t: 'Frontend Frameworks', d: 'React.js, Next.js, React Native, Redux, Context API' },
      { t: 'Styling & Design', d: 'Tailwind CSS, CSS Modules, Styled Components, Sass, Responsive Design, Framer Motion' },
      { t: 'Tools & Platforms', d: 'Git, GitHub, Figma, VS Code, Webpack, Vite, Postman' },
    ],
  },
  {
    id: 'experience', title: 'EXPERIENCE', color: '#c77dff', marker: [-135, 35], bld: [-162, 62], size: [34, 24, 26],
    mission: { type: 'speed', kmh: 100, text: 'Get back in your car, hit 100 km/h, then reach the PURPLE ring.' },
    items: [
      { t: 'Full Stack Developer (Freelance) — Karnataka Sanskrit University', d: 'Karnataka · July 2026 – Present\n• Developing and maintaining the university\'s web portal(s), building new features across the frontend and backend to support students, faculty and administrative staff.\n• Building responsive, accessible React.js interfaces and integrating them with backend services and databases to streamline university workflows.\n• Implementing secure authentication, input validation and clean, maintainable code practices to keep the portal reliable and scalable.' },
      { t: 'Frontend Developer Intern — IITB Trust Lab', d: 'Mumbai · March – June 2026\n• Developed a custom Security Operations Center (SOC) dashboard using React.js, Kibana and Elasticsearch for real-time security log monitoring and visualization.\n• Built responsive and reusable UI components integrated with Elasticsearch data pipelines, enabling efficient threat detection and log analysis.\n• Enhanced security monitoring workflows by contributing to alerting features and improving dashboard usability for incident response.' },
    ],
  },
  {
    id: 'projects', title: 'PROJECTS', color: '#4dc9ff', marker: [35, -35], bld: [62, -62], size: [34, 30, 26],
    mission: { type: 'orbs', orbs: [[-100, 0], [-50, 0], [0, -12]], text: 'Collect the 3 glowing orbs on the road, then reach the BLUE ring.' },
    items: [
      { t: 'Avalanche 2025 — Full Stack Web Application', d: '• Built a modern, fully responsive React.js frontend with cross-browser compatibility and performance optimization, integrated with Firebase for real-time data synchronization and live updates.\n• Implemented a QR code–based authentication system using RSA-encrypted unique IDs with an offline decryption backbone, validating 1,600+ registrations within 3 hours with secure, fast, duplicate-free entry management.\n• Developed secured RESTful API endpoints with JWT authentication, HTTPS/TLS encryption, authentication middleware, input validation and sanitization (XSS & injection prevention), and environment-based configuration management for sensitive credentials.' },
      { t: 'Aura 2026 — Security Systems', d: '• Built a secure, scalable MERN stack application (MongoDB, Express.js, React.js, Node.js) with RBAC-based authentication, protected routes, JWT token security and encrypted HTTPS/TLS communication.\n• Designed a robust security architecture including secured REST APIs, authentication middleware, input validation/sanitization (XSS & injection prevention), environment-based secret management, and a QR-code–based access control system for fast, secure verification.\n• Optimized the system for high performance and scale, supporting 200+ concurrent users and 10,000+ registrations, deployed on a low-latency intranet environment with clean, modular code for long-term maintainability.' },
    ],
  },
  {
    id: 'achievements', title: 'ACHIEVEMENTS', color: '#ff8a4d', marker: [135, 35], bld: [162, 62], size: [34, 20, 26],
    mission: { type: 'time', secs: 90, text: 'Time trial! Reach the ORANGE ring before the countdown hits zero.' },
    items: [
      { t: '1st Runner-Up — IEEE Girl Geek National Level Hackathon', d: 'Drowsiness Detector Project' },
      { t: 'Certifications — Udemy', d: 'Frontend Developer Certification\nMERN Stack Developer Certification' },
    ],
  },
  {
    id: 'contact', title: 'CONTACT', color: '#7dff6b', marker: [35, 35], bld: [62, 62], size: [34, 14, 26],
    mission: { type: 'any', text: 'Final mission! Reach the GREEN ring any way you like.' },
    items: [
      { t: 'Email', d: 'darshanmutalikdesai22@gmail.com', link: 'mailto:darshanmutalikdesai22@gmail.com' },
      { t: 'Location', d: 'Belagavi, Karnataka, India' },
      { t: 'LinkedIn', d: 'linkedin.com/in/darshan-mutalikdesai-b4a4832a0', link: 'https://www.linkedin.com/in/darshan-mutalikdesai-b4a4832a0' },
      { t: 'Portfolio', d: 'darshanmutalikdesai.dev', link: 'https://darshanmutalikdesai.dev/' },
    ],
  },
]
