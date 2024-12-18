// src/data/legalContent.ts

export interface Section {
  title: string;
  content: string | string[];
}

export interface LegalContent {
  title: string;
  notice: string;
  sections: Section[];
}

export const termsOfServiceContent: LegalContent = {
  title: "Terms of Service",
  notice: "Please Note: ExpenseTracker is a personal portfolio project created to demonstrate technical skills and is not intended for commercial use. This application serves as a showcase of development capabilities and implementation of various technologies.",
  sections: [
    {
      title: "1. Project Purpose",
      content: "This application is developed as a portfolio project to demonstrate proficiency in modern web development technologies. It is not a commercial product and is provided \"as is\" without any warranties or guarantees."
    },
    {
      title: "2. Non-Commercial Status",
      content: "ExpenseTracker is a personal project intended for demonstration purposes only. It is not a commercial service and does not offer any guaranteed uptime, support, or maintenance."
    },
    {
      title: "3. Data Collection & Usage",
      content: "While the application may collect user data for demonstration purposes, it complies with GDPR principles as required by Irish law. Users have the right to access, modify, or delete their data at any time."
    },
    {
      title: "4. Intellectual Property",
      content: "This project is a personal work created for portfolio demonstration. While the code and implementation are original, it may utilize open-source libraries and frameworks, each with their respective licenses."
    },
    {
      title: "5. User Responsibilities",
      content: [
        "Users understand this is a demonstration project",
        "Users agree not to misuse or attempt to exploit the application",
        "Users acknowledge this is not a commercial financial management tool"
      ]
    },
    {
      title: "6. Disclaimer",
      content: "This application is provided for demonstration purposes only. The developer assumes no liability for any issues arising from its use. Users engage with the application at their own risk."
    },
    {
      title: "7. Irish Law Compliance",
      content: "While this is a demonstration project, it adheres to relevant Irish laws regarding data protection and user privacy, including compliance with the Data Protection Act 2018 and GDPR requirements."
    },
    {
      title: "8. Contact Information",
      content: "For any questions about this portfolio project, please contact the developer through the provided GitHub repository or portfolio website."
    }
  ]
};

export const privacyPolicyContent: LegalContent = {
  title: "Privacy Policy",
  notice: "ExpenseTracker is a portfolio demonstration project. While we take privacy seriously and implement appropriate protections, users should be aware this is not a commercial service.",
  sections: [
    {
      title: "1. Personal Project Declaration",
      content: "This privacy policy applies to ExpenseTracker, a personal portfolio project developed to showcase technical skills and implementation capabilities. It is not a commercial product."
    },
    {
      title: "2. Data Controller",
      content: "For the purposes of Irish data protection law and GDPR, the project creator serves as the data controller for any personal information collected through this application."
    },
    {
      title: "3. Information We Collect",
      content: [
        "Basic account information (email, name)",
        "Financial data entered for expense tracking demonstration",
        "Usage patterns for portfolio demonstration"
      ]
    },
    {
      title: "4. How We Use Your Information",
      content: [
        "Demonstrating application functionality",
        "Showcasing user experience features",
        "Testing and improving the portfolio project"
      ]
    },
    {
      title: "5. Data Protection Rights",
      content: [
        "Access their personal data",
        "Correct inaccurate data",
        "Request data deletion",
        "Object to data processing",
        "Request data portability"
      ]
    },
    {
      title: "6. Data Security",
      content: [
        "Secure data encryption",
        "Firebase security rules and authentication",
        "Regular security testing"
      ]
    },
    {
      title: "7. Cookies and Tracking",
      content: "The application may use essential cookies for demonstration purposes. No third-party tracking is implemented beyond basic Firebase Analytics for portfolio demonstration."
    },
    {
      title: "8. Changes to Privacy Policy",
      content: "As this is a portfolio project, this privacy policy may be updated to reflect new features or technologies being demonstrated. Users will be notified of significant changes."
    },
    {
      title: "9. Contact Information",
      content: "For any privacy-related queries about this portfolio project, please contact through the provided GitHub repository or portfolio website."
    }
  ]
};