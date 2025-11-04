export interface Category {
  meCategory: {
    id: string
    title: string
    description: string
    icon: string | null
    urlImage: string | null
    categoryMainId: string | null
    dateCreated: string
    userCreated: string
  }
  children: Category[]
}

export interface User {
  id: string
  userName: string
  lastName: string
  firstName: string
  urlImage: string | null
  details: string
}

export interface Content {
  content: {
    id: string
    title: string
    details: string
    dateCreate: string
    userId: string
    urlImage: string | null
    categoryId: string
    dateUpdate: string
    code: "post" | "research"
  }
  interactiveCounts: {
    showCount: number
    likeCount: number
    commentCount: number
    notLikeCount: number
  }
  myInterActive: {
    isLike: boolean
    isNotLike: boolean
    isLove: boolean
  }
  shortDetailsUser: User
  category: {
    id: string
    title: string
    description: string
    icon: string | null
    urlImage: string | null
    categoryMainId: string
    dateCreated: string
    userCreated: string
  }
}

export interface Settings {
  limits: {
    maxCommentLength: number
    maxTitleLength: number
    maxTags: number
  }
  site: {
    name: string
    logoUrl: string
  }
}

// // Mock Categories Data
// export const mockCategories: Category[] = [
//   {
//     meCategory: {
//       id: "6bab9ebd-de2a-4242-a0b0-7d34fca39c13",
//       title: "الطب",
//       description: "هل ما يخص المجال الطبي",
//       icon: null,
//       urlImage: "2025091817205894-5794007360610615845_121.jpg",
//       categoryMainId: null,
//       dateCreated: "2025-09-18T17:20:58.9458794",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//     children: [
//       {
//         meCategory: {
//           id: "996c3c02-28d4-402e-907c-807289d642f7",
//           title: "العمليات الجراحية",
//           description: "هل ما يخص المجال العمليات",
//           icon: null,
//           urlImage: "2025091817215315-5794007360610615845_121.jpg",
//           categoryMainId: "6bab9ebd-de2a-4242-a0b0-7d34fca39c13",
//           dateCreated: "2025-09-18T17:21:53.1536907",
//           userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//         },
//         children: [],
//       },
//     ],
//   },
  
//   {
//     meCategory: {
//       id: "08f07d2d-0322-465d-be9a-8f462198310a",
//       title: "البرمجة",
//       description: "كل ما يخص البرمجية من لغات وادوات",
//       icon: "pr",
//       urlImage: null,
//       categoryMainId: null,
//       dateCreated: "2025-09-18T17:08:13.0872517",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//     children: [
//       {
//         meCategory: {
//           id: "ff29207e-6f1c-410e-9b51-22d352b0b75e",
//           title: "لغات البرمجة",
//           description: "كل لغات البرمجة و ادواتها",
//           icon: "langauleg",
//           urlImage: null,
//           categoryMainId: "08f07d2d-0322-465d-be9a-8f462198310a",
//           dateCreated: "2025-09-18T17:10:41.1658414",
//           userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//         },
//         children: [],
//       },
//       {
//         meCategory: {
//           id: "5aa2378a-4017-42a5-81d2-587860a7f8a3",
//           title: "الخوارزميات",
//           description: "شرح تطور الخوارزميات",
//           icon: "algru",
//           urlImage: "2025091817164526-5996850582872246189_120.jpg",
//           categoryMainId: "08f07d2d-0322-465d-be9a-8f462198310a",
//           dateCreated: "2025-09-18T17:16:45.2603633",
//           userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//         },
//         children: [
//           {
//             meCategory: {
//               id: "fc556af5-db57-4f54-bda1-4d9d26c0f4a0",
//               title: "هياكل البيانات",
//               description: "شرح تطور الهياكل",
//               icon: "algru",
//               urlImage: null,
//               categoryMainId: "5aa2378a-4017-42a5-81d2-587860a7f8a3",
//               dateCreated: "2025-09-18T17:17:56.467753",
//               userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//             },
//             children: [],
//           },
//         ],
//       },
//       {
//         meCategory: {
//           id: "83bee4a6-62f9-4fc5-9ee7-8c4913d6787a",
//           title: "ادوات البرمجة",
//           description: "كل لغات البرمجة و ادواتها",
//           icon: "langauleg",
//           urlImage: null,
//           categoryMainId: "08f07d2d-0322-465d-be9a-8f462198310a",
//           dateCreated: "2025-09-18T17:14:08.6127572",
//           userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//         },
//         children: [],
//       },
//     ],
//   },
//   {
//     meCategory: {
//       id: "3cb9ccff-98e5-4b3f-9522-99f268246b64",
//       title: "تقنية",
//       description: "هل ما يخص التكنلوجيا و التقنية",
//       icon: null,
//       urlImage: null,
//       categoryMainId: null,
//       dateCreated: "2025-09-18T17:06:34.0722559",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//     children: [],
//   },
//   {
//     meCategory: {
//       id: "3cb9ccff-98e5-4b3f-9522-99f268246b643",
//       title: "هيثم الغباري",
//       description: "هل ما يخص التكنلوجيا و التقنية",
//       icon: null,
//       urlImage: null,
//       categoryMainId: null,
//       dateCreated: "2025-09-18T17:06:34.0722559",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//     children: [],
//   },
//   {
//     meCategory: {
//       id: "a3fb006f-6152-4b6f-b20a-e37dd1e5708e",
//       title: "الطاقة النظيفة",
//       description: "كل ما يخص الطاقة النظيفة",
//       icon: "sun",
//       urlImage: null,
//       categoryMainId: null,
//       dateCreated: "2025-09-18T17:18:40.4423003",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//     children: [],
//   },
// ]

// Mock Categories Data
export const mockCategories: Category[] = [
  {
    meCategory: {
      id: "6bab9ebd-de2a-4242-a0b0-7d34fca39c13",
      title: "الطب",
      description: "كل ما يخص المجال الطبي والصحة السريرية",
      icon: "stethoscope",
      urlImage: "cat-medicine-20250918.jpg",
      categoryMainId: null,
      dateCreated: "2025-09-18T17:20:58.9458794",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "996c3c02-28d4-402e-907c-807289d642f7",
          title: "العمليات الجراحية",
          description: "المقالات والدراسات حول الجراحة وتقنياتها",
          icon: "scalpel",
          urlImage: "cat-surgery-20250918.jpg",
          categoryMainId: "6bab9ebd-de2a-4242-a0b0-7d34fca39c13",
          dateCreated: "2025-09-18T17:21:53.1536907",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [
          {
            meCategory: {
              id: "a11d3f22-1a2b-4c3d-99e1-1234567890a1",
              title: "جراحة القلب",
              description: "أحدث تقنيات جراحة القلب وإدارة المرضى بعد العملية",
              icon: "heart-surgery",
              urlImage: null,
              categoryMainId: "996c3c02-28d4-402e-907c-807289d642f7",
              dateCreated: "2025-09-18T17:22:50.0000000",
              userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
            },
            children: [],
          },
        ],
      },
      {
        meCategory: {
          id: "b22e4d33-2b3c-4d5e-88f2-2345678901b2",
          title: "الطوارئ والإسعاف",
          description: "إجراءات الطوارئ وأحدث بروتوكولات الإسعاف",
          icon: "ambulance",
          urlImage: null,
          categoryMainId: "6bab9ebd-de2a-4242-a0b0-7d34fca39c13",
          dateCreated: "2025-09-18T17:25:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "08f07d2d-0322-465d-be9a-8f462198310a",
      title: "البرمجة",
      description: "كل ما يخص البرمجيات، لغات البرمجة وأطر العمل",
      icon: "code",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-09-18T17:08:13.0872517",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "ff29207e-6f1c-410e-9b51-22d352b0b75e",
          title: "لغات البرمجة",
          description: "دروس ومقارنات بين لغات البرمجة الشائعة",
          icon: "languages",
          urlImage: null,
          categoryMainId: "08f07d2d-0322-465d-be9a-8f462198310a",
          dateCreated: "2025-09-18T17:10:41.1658414",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [
          {
            meCategory: {
              id: "l1ang-0001-1111-2222-3333lang1",
              title: "جافاسكربت",
              description: "مقالات وأمثلة عملية في جافاسكربت وReact وNode",
              icon: "js",
              urlImage: null,
              categoryMainId: "ff29207e-6f1c-410e-9b51-22d352b0b75e",
              dateCreated: "2025-09-18T17:11:00.0000000",
              userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
            },
            children: [],
          },
        ],
      },
      {
        meCategory: {
          id: "5aa2378a-4017-42a5-81d2-587860a7f8a3",
          title: "الخوارزميات",
          description: "شرح وتطبيقات الخوارزميات وهياكل البيانات",
          icon: "algorithm",
          urlImage: "cat-algorithms-20250918.jpg",
          categoryMainId: "08f07d2d-0322-465d-be9a-8f462198310a",
          dateCreated: "2025-09-18T17:16:45.2603633",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [
          {
            meCategory: {
              id: "fc556af5-db57-4f54-bda1-4d9d26c0f4a0",
              title: "هياكل البيانات",
              description: "قوائم، أشجار، جداول تجزئة والمزيد مع أمثلة عملية",
              icon: "datastructure",
              urlImage: null,
              categoryMainId: "5aa2378a-4017-42a5-81d2-587860a7f8a3",
              dateCreated: "2025-09-18T17:17:56.467753",
              userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
            },
            children: [],
          },
        ],
      },
      {
        meCategory: {
          id: "83bee4a6-62f9-4fc5-9ee7-8c4913d6787a",
          title: "أدوات البرمجة",
          description: "محررات، حزم، أدوات بناء واختبار البرمجيات",
          icon: "tools",
          urlImage: null,
          categoryMainId: "08f07d2d-0322-465d-be9a-8f462198310a",
          dateCreated: "2025-09-18T17:14:08.6127572",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "3cb9ccff-98e5-4b3f-9522-99f268246b64",
      title: "التقنية",
      description: "أخبار ومقالات حول التكنولوجيا والابتكار",
      icon: "tech",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-09-18T17:06:34.0722559",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "t-1010-gadgets-2025-aaaa",
          title: "الأجهزة والعتاد",
          description: "مراجعات ومقارنات للأجهزة والتجهيزات التقنية",
          icon: "device",
          urlImage: null,
          categoryMainId: "3cb9ccff-98e5-4b3f-9522-99f268246b64",
          dateCreated: "2025-09-19T09:00:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "a3fb006f-6152-4b6f-b20a-e37dd1e5708e",
      title: "الطاقة النظيفة",
      description: "الأخبار والمقالات حول الطاقة المتجددة والاستدامة",
      icon: "sun",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-09-18T17:18:40.4423003",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "r-2025-solar-wind-001",
          title: "الطاقة الشمسية",
          description: "التقنيات والأنظمة للطاقة الشمسية المنزلية والصناعية",
          icon: "solar",
          urlImage: null,
          categoryMainId: "a3fb006f-6152-4b6f-b20a-e37dd1e5708e",
          dateCreated: "2025-09-18T17:19:30.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "44455566-7777-8888-9999-aaaa11112222",
      title: "التصميم",
      description: "مقالات ودروس عن التصميم الجرافيكي وتجربة المستخدم",
      icon: "design",
      urlImage: "cat-design-20250917.jpg",
      categoryMainId: null,
      dateCreated: "2025-09-17T12:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "dsg-uxui-0001-2222-3333",
          title: "تصميم واجهات المستخدم (UI/UX)",
          description: "أفضل الممارسات والتصاميم العملية لتجربة المستخدم",
          icon: "ux",
          urlImage: null,
          categoryMainId: "44455566-7777-8888-9999-aaaa11112222",
          dateCreated: "2025-09-17T12:10:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "66677788-aaaa-bbbb-cccc-ddddeeeeff77",
      title: "التسويق",
      description: "استراتيجيات وأدوات للتسويق الرقمي والمحتوى",
      icon: "megaphone",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-08-05T10:15:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "mkt-content-001-2025",
          title: "التسويق بالمحتوى",
          description: "كتابة المحتوى، استراتيجيات النشر وتحسين SEO",
          icon: "content",
          urlImage: null,
          categoryMainId: "66677788-aaaa-bbbb-cccc-ddddeeeeff77",
          dateCreated: "2025-08-05T10:20:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "999aaaab-bbbb-cccc-dddd-eeeeffff0001",
      title: "أمن المعلومات",
      description: "حماية الأنظمة والبيانات، واختبار الاختراق",
      icon: "lock",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-07-01T09:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "sec-pen-test-2025-01",
          title: "اختبار الاختراق",
          description: "أدوات وتقنيات لاختبار أمان التطبيقات",
          icon: "shield",
          urlImage: null,
          categoryMainId: "999aaaab-bbbb-cccc-dddd-eeeeffff0001",
          dateCreated: "2025-07-01T09:15:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "dbbcccdd-eeff-0011-2233-445566778899",
      title: "قواعد البيانات",
      description: "تصميم، تحسين وإدارة قواعد البيانات العلائقية وغير العلائقية",
      icon: "database",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-06-15T08:30:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "db-performance-2025-01",
          title: "تحسين الأداء",
          description: "أمثلة على تحسين الاستعلامات والفهارس والتقسيم",
          icon: "speed",
          urlImage: null,
          categoryMainId: "dbbcccdd-eeff-0011-2233-445566778899",
          dateCreated: "2025-06-15T08:40:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "eeff0011-2233-4455-6677-8899aabbcc00",
      title: "الوظائف",
      description: "فرص العمل، السير الذاتية ونصائح المقابلات المهنية",
      icon: "briefcase",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-04-01T09:15:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "career-growth-2025-01",
          title: "تطوير المسار المهني",
          description: "نصائح للترقي وتعلم المهارات المطلوبة في السوق",
          icon: "career",
          urlImage: null,
          categoryMainId: "eeff0011-2233-4455-6677-8899aabbcc00",
          dateCreated: "2025-04-01T09:30:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "ff112233-4455-6677-8899-aabbccddeeff",
      title: "التعليم",
      description: "موارد ومقالات حول أساليب التعليم والتعلم الإلكتروني",
      icon: "book",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-03-10T07:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "elearning-2025-01",
          title: "التعلم الإلكتروني",
          description: "تصميم الدورات، منصات LMS واستراتيجيات التعلم",
          icon: "lms",
          urlImage: null,
          categoryMainId: "ff112233-4455-6677-8899-aabbccddeeff",
          dateCreated: "2025-03-10T07:10:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "11223344-5566-7788-99aa-bbccddeeff12",
      title: "ريادة الأعمال",
      description: "موارد ودروس لروّاد الأعمال وبناء الشركات الناشئة",
      icon: "startup",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2024-12-12T09:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "funding-growth-2025-01",
          title: "التمويل والنمو",
          description: "استراتيجيات جمع التمويل وتسريع نمو المنتج",
          icon: "fund",
          urlImage: null,
          categoryMainId: "11223344-5566-7788-99aa-bbccddeeff12",
          dateCreated: "2025-01-05T10:00:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "22334455-6677-8899-aabb-ccddeeff0012",
      title: "الصحة",
      description: "مقالات ونصائح حول الصحة والرفاهية",
      icon: "health",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-03-22T10:20:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "wellness-2025-01",
          title: "الرفاهية ونمط الحياة",
          description: "تغذية، تمارين ونصائح لإدارة التوتر",
          icon: "wellness",
          urlImage: null,
          categoryMainId: "22334455-6677-8899-aabb-ccddeeff0012",
          dateCreated: "2025-03-22T10:30:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  },

  {
    meCategory: {
      id: "33445566-7788-99aa-bbcc-ddeeff001122",
      title: "الرياضة",
      description: "أخبار وتحليلات حول البطولات واللياقة البدنية",
      icon: "sports",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-02-01T11:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "44556677-8899-aabb-ccdd-eeff00112233",
      title: "الثقافة والفنون",
      description: "مقالات نقدية، مراجعات وأخبار ثقافية",
      icon: "culture",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-01-15T13:45:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "55667788-99aa-bbcc-ddee-ff0011223344",
      title: "العلوم",
      description: "أخبار وبحوث في الفيزياء، الكيمياء والعلوم التطبيقية",
      icon: "science",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2024-10-10T08:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "66778899-aabb-ccdd-eeff-001122334455",
      title: "السيارات",
      description: "مراجعات وتغطية لأحدث السيارات والتقنيات المتعلقة بها",
      icon: "car",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2024-08-20T10:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "778899aa-bbcc-ddee-ff00-112233445566",
      title: "السفر والسياحة",
      description: "دليل وجهات السفر، نصائح وتأمين السفر",
      icon: "travel",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2024-07-05T09:30:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "8899aabb-ccdd-eeff-0011-223344556677",
      title: "الاقتصاد والأعمال",
      description: "تحليلات اقتصادية وأخبار الشركات والأسواق",
      icon: "economy",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2024-05-12T10:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "99aabbcc-ddee-ff00-1122-334455667788",
      title: "القانون والسياسة",
      description: "تحليلات قانونية وأخبار سياسية ذات صلة بالمجتمع والتقنية",
      icon: "gavel",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2024-03-01T12:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [],
  },

  {
    meCategory: {
      id: "aabbccdd-eeff-0011-2233-445566778899",
      title: "وسائل التواصل الاجتماعي",
      description: "أدلة، استراتيجيات وتحليلات لمنصات التواصل",
      icon: "social",
      urlImage: null,
      categoryMainId: null,
      dateCreated: "2025-02-20T14:00:00.0000000",
      userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
    },
    children: [
      {
        meCategory: {
          id: "smedia-growth-2025-01",
          title: "نمو المتابعين",
          description: "استراتيجيات عملية لزيادة التفاعل والمتابعين",
          icon: "growth",
          urlImage: null,
          categoryMainId: "aabbccdd-eeff-0011-2233-445566778899",
          dateCreated: "2025-02-20T14:10:00.0000000",
          userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
        },
        children: [],
      },
    ],
  }
];


// // Mock Content Data
// export const mockContent: Content[] = [
//   {
//     content: {
//       id: "7866916e-a50c-434b-a935-12f673336220",
//       title: "The Future of Web Development: What's Coming in 2025",
//       details:
//         "Exploring the latest trends and technologies that will shape web development in the coming year, including new frameworks, AI integration, and performance optimizations.",
//       dateCreate: "2025-09-20T17:45:17.9964143",
//       userId: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//       urlImage: "/futuristic-web-development-coding-screen.jpg",
//       categoryId: "08f07d2d-0322-465d-be9a-8f462198310a",
//       dateUpdate: "2025-09-20T17:45:17.9964168",
//       code: "post",
//     },
//     interactiveCounts: {
//       showCount: 125,
//       likeCount: 28,
//       commentCount: 12,
//       notLikeCount: 3,
//     },
//     myInterActive: {
//       isLike: false,
//       isNotLike: false,
//       isLove: false,
//     },
//     shortDetailsUser: {
//       id: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//       userName: "johndoe",
//       lastName: "Doe",
//       firstName: "John",
//       urlImage: "/professional-developer-avatar.png",
//       details: "Full stack developer and tech enthusiast",
//     },
//     category: {
//       id: "08f07d2d-0322-465d-be9a-8f462198310a",
//       title: "البرمجة",
//       description: "كل ما يخص البرمجية من لغات وادوات",
//       icon: "pr",
//       urlImage: null,
//       categoryMainId: "",
//       dateCreated: "2025-09-18T17:08:13.0872517",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//   },
//   {
//     content: {
//       id: "8977027f-b61d-545c-a046-23f784447331",
//       title: "Machine Learning Research: Breakthrough in Natural Language Processing",
//       details:
//         "Our latest research paper demonstrates significant improvements in language model efficiency while maintaining high accuracy across multiple benchmarks.",
//       dateCreate: "2025-09-19T14:30:22.1234567",
//       userId: "d89cfd5e-8b17-58d8-af85-a317d5517935",
//       urlImage: "/ai-neural-network.png",
//       categoryId: "3cb9ccff-98e5-4b3f-9522-99f268246b64",
//       dateUpdate: "2025-09-19T14:30:22.1234567",
//       code: "research",
//     },
//     interactiveCounts: {
//       showCount: 567,
//       likeCount: 89,
//       commentCount: 34,
//       notLikeCount: 5,
//     },
//     myInterActive: {
//       isLike: true,
//       isNotLike: false,
//       isLove: false,
//     },
//     shortDetailsUser: {
//       id: "d89cfd5e-8b17-58d8-af85-a317d5517935",
//       userName: "mlresearcher",
//       lastName: "Rodriguez",
//       firstName: "Dr. Michael",
//       urlImage: "/researcher-scientist-avatar.jpg",
//       details: "AI researcher specializing in NLP and machine learning",
//     },
//     category: {
//       id: "3cb9ccff-98e5-4b3f-9522-99f268246b64",
//       title: "تقنية",
//       description: "هل ما يخص التكنلوجيا و التقنية",
//       icon: null,
//       urlImage: null,
//       categoryMainId: "",
//       dateCreated: "2025-09-18T17:06:34.0722559",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//   },
//   {
//     content: {
//       id: "9a88138g-c72e-656d-b157-34g895558442",
//       title: "Clean Energy Solutions for Smart Cities",
//       details:
//         "Innovative approaches to integrating renewable energy sources in urban environments, focusing on solar panels, wind turbines, and energy storage systems.",
//       dateCreate: "2025-09-18T09:15:45.7890123",
//       userId: "e9adef6f-9c28-69e9-bg96-b428e6628a46",
//       urlImage: "/solar-panels-smart-city-green-energy.jpg",
//       categoryId: "a3fb006f-6152-4b6f-b20a-e37dd1e5708e",
//       dateUpdate: "2025-09-18T09:15:45.7890123",
//       code: "post",
//     },
//     interactiveCounts: {
//       showCount: 234,
//       likeCount: 45,
//       commentCount: 18,
//       notLikeCount: 2,
//     },
//     myInterActive: {
//       isLike: false,
//       isNotLike: false,
//       isLove: false,
//     },
//     shortDetailsUser: {
//       id: "e9adef6f-9c28-69e9-bg96-b428e6628a46",
//       userName: "greentech",
//       lastName: "Johnson",
//       firstName: "Sarah",
//       urlImage: "/environmental-engineer-avatar.jpg",
//       details: "Environmental engineer and sustainability advocate",
//     },
//     category: {
//       id: "a3fb006f-6152-4b6f-b20a-e37dd1e5708e",
//       title: "الطاقة النظيفة",
//       description: "كل ما يخص الطاقة النظيفة",
//       icon: "sun",
//       urlImage: null,
//       categoryMainId: "",
//       dateCreated: "2025-09-18T17:18:40.4423003",
//       userCreated: "c78bec4d-7a06-47c7-9f74-9206c4406824",
//     },
//   },
// ]
// Mock Content Data
export const mockContent: Content[] = [
  {
    content: {
      id: "a1f3c9d2-0b4e-4e7a-9f21-1a2b3c4d5e01",
      title: "مستقبل تطوير الويب في 2025",
      details:
        "استعراض لأهم الاتجاهات والتقنيات التي ستشكل تطوير الويب خلال عام 2025، مع التركيز على التكامل مع الذكاء الاصطناعي وتحسين الأداء.",
      dateCreate: "2025-09-20T10:12:34.000Z",
      userId: "u1-3f9a2b7c-1111-4444-8888-aaaa1111bbbb",
      urlImage: "/images/web-future-2025.jpg",
      categoryId: "c-11111111-2222-3333-4444-555555555501",
      dateUpdate: "2025-09-20T10:12:34.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 1240,
      likeCount: 320,
      commentCount: 48,
      notLikeCount: 12
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u1-3f9a2b7c-1111-4444-8888-aaaa1111bbbb",
      userName: "mohammed_dev",
      lastName: "الحدادي",
      firstName: "محمد",
      urlImage: "/avatars/mohammed.png",
      details: "مطور ويب ومهتم بالتقنيات الحديثة"
    },
    category: {
      id: "c-11111111-2222-3333-4444-555555555501",
      title: "البرمجة",
      description: "مقالات ودروس حول لغات البرمجة وأطر العمل",
      icon: "code",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-08-01T08:00:00.000Z",
      userCreated: "u1-3f9a2b7c-1111-4444-8888-aaaa1111bbbb"
    }
  },
  {
    content: {
      id: "b2e4d8f3-1c5f-4f8b-8a32-2b3c4d5e6f02",
      title: "بحث في معالجة اللغة الطبيعية وتحسين النماذج",
      details:
        "نتائج بحثية جديدة تُحسّن كفاءة نماذج معالجة اللغة مع الحفاظ على دقة عالية عبر مجموعات اختبار متعددة.",
      dateCreate: "2025-09-19T14:30:22.000Z",
      userId: "u2-4a8b9c0d-2222-5555-9999-bbbb2222cccc",
      urlImage: "/images/nlp-research.jpg",
      categoryId: "c-22222222-3333-4444-5555-666666666602",
      dateUpdate: "2025-09-19T14:30:22.000Z",
      code: "research"
    },
    interactiveCounts: {
      showCount: 3400,
      likeCount: 890,
      commentCount: 134,
      notLikeCount: 25
    },
    myInterActive: {
      isLike: true,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u2-4a8b9c0d-2222-5555-9999-bbbb2222cccc",
      userName: "dr_ali_nlp",
      lastName: "المرشدي",
      firstName: "علي",
      urlImage: "/avatars/ali.png",
      details: "باحث في الذكاء الاصطناعي ومعالجة اللغة"
    },
    category: {
      id: "c-22222222-3333-4444-5555-666666666602",
      title: "الذكاء الاصطناعي",
      description: "أحدث الأبحاث والتطبيقات في الذكاء الاصطناعي",
      icon: "ai",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-07-15T09:30:00.000Z",
      userCreated: "u2-4a8b9c0d-2222-5555-9999-bbbb2222cccc"
    }
  },
  {
    content: {
      id: "c3f5e9a4-2d6a-5a9c-7b43-3c4d5e6f7a03",
      title: "حلول الطاقة النظيفة للمدن الذكية",
      details:
        "نُقاش حول طرق دمج مصادر الطاقة المتجددة في البيئات الحضرية، مع التركيز على الألواح الشمسية وتخزين الطاقة.",
      dateCreate: "2025-09-18T09:15:45.000Z",
      userId: "u3-5b9c0d1e-3333-6666-aaaa-cccc3333dddd",
      urlImage: "/images/clean-energy.jpg",
      categoryId: "c-33333333-4444-5555-6666-777777777703",
      dateUpdate: "2025-09-18T09:15:45.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 980,
      likeCount: 210,
      commentCount: 38,
      notLikeCount: 7
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u3-5b9c0d1e-3333-6666-aaaa-cccc3333dddd",
      userName: "sarah_green",
      lastName: "الغنام",
      firstName: "سارة",
      urlImage: "/avatars/sarah.png",
      details: "مهندسة بيئية ومدافعة عن الاستدامة"
    },
    category: {
      id: "c-33333333-4444-5555-6666-777777777703",
      title: "الطاقة النظيفة",
      description: "الأخبار والمقالات حول الطاقة المتجددة والاستدامة",
      icon: "sun",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-06-20T11:00:00.000Z",
      userCreated: "u3-5b9c0d1e-3333-6666-aaaa-cccc3333dddd"
    }
  },
  {
    content: {
      id: "d4a6f0b5-3e7b-6b0d-8c54-4d5e6f7a8b04",
      title: "استراتيجيات تعليمية للتعلم الإلكتروني الفعّال",
      details:
        "دليل عملي لتصميم دورات إلكترونية عالية التأثير وتحسين تفاعل المتعلمين عبر الإنترنت.",
      dateCreate: "2025-09-15T12:05:10.000Z",
      userId: "u4-6c0d1e2f-4444-7777-bbbb-eeee4444ffff",
      urlImage: "/images/elearning-strategies.jpg",
      categoryId: "c-44444444-5555-6666-7777-888888888804",
      dateUpdate: "2025-09-15T12:05:10.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 720,
      likeCount: 150,
      commentCount: 22,
      notLikeCount: 4
    },
    myInterActive: {
      isLike: true,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u4-6c0d1e2f-4444-7777-bbbb-eeee4444ffff",
      userName: "noura_teacher",
      lastName: "السالم",
      firstName: "نورا",
      urlImage: "/avatars/noura.png",
      details: "مصممة تعليم إلكتروني ومدرّبة"
    },
    category: {
      id: "c-44444444-5555-6666-7777-888888888804",
      title: "التعليم",
      description: "موارد ومقالات حول التعليم والتعلّم عن بعد",
      icon: "book",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-05-10T07:45:00.000Z",
      userCreated: "u4-6c0d1e2f-4444-7777-bbbb-eeee4444ffff"
    }
  },
  {
    content: {
      id: "e5b7g1c6-4f8c-7c1e-9d65-5e6f7a8b9c05",
      title: "نصائح لتحسين صحة القلب في الحياة اليومية",
      details:
        "مجموعة توصيات بسيطة وعلمية للحفاظ على صحة القلب من خلال التغذية والتمارين وإدارة التوتر.",
      dateCreate: "2025-09-12T08:50:00.000Z",
      userId: "u5-7d1e2f3g-5555-8888-cccc-dddd5555eeee",
      urlImage: "/images/heart-health.jpg",
      categoryId: "c-55555555-6666-7777-8888-999999999905",
      dateUpdate: "2025-09-12T08:50:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 640,
      likeCount: 98,
      commentCount: 16,
      notLikeCount: 2
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: true
    },
    shortDetailsUser: {
      id: "u5-7d1e2f3g-5555-8888-cccc-dddd5555eeee",
      userName: "dr_salem",
      lastName: "سالم",
      firstName: "طارق",
      urlImage: "/avatars/salem.png",
      details: "طبيب باطني مهتم بالصحة العامة"
    },
    category: {
      id: "c-55555555-6666-7777-8888-999999999905",
      title: "الصحة",
      description: "نصائح ومقالات صحية وطبية للمستخدمين",
      icon: "heart",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-03-22T10:20:00.000Z",
      userCreated: "u5-7d1e2f3g-5555-8888-cccc-dddd5555eeee"
    }
  },
  {
    content: {
      id: "f6c8h2d7-5g9d-8d2f-0e76-6f7a8b9c0d06",
      title: "استراتيجيات تسويق رقمي للمشاريع الصغيرة",
      details:
        "خطة مبسطة وقابلة للتنفيذ تساعد المشاريع الصغيرة على زيادة الوصول والمبيعات عبر القنوات الرقمية.",
      dateCreate: "2025-09-10T16:40:00.000Z",
      userId: "u6-8e2f3g4h-6666-9999-dddd-ffff6666aaaa",
      urlImage: "/images/digital-marketing.jpg",
      categoryId: "c-66666666-7777-8888-9999-aaaaaaaaa606",
      dateUpdate: "2025-09-10T16:40:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 420,
      likeCount: 76,
      commentCount: 9,
      notLikeCount: 1
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u6-8e2f3g4h-6666-9999-dddd-ffff6666aaaa",
      userName: "layla_marketer",
      lastName: "الخطيب",
      firstName: "ليلى",
      urlImage: "/avatars/layla.png",
      details: "مسوقة رقمية خبيرة في المشاريع الناشئة"
    },
    category: {
      id: "c-66666666-7777-8888-9999-aaaaaaaaa606",
      title: "التسويق",
      description: "استراتيجيات وأدوات التسويق الرقمي",
      icon: "megaphone",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-02-05T13:10:00.000Z",
      userCreated: "u6-8e2f3g4h-6666-9999-dddd-ffff6666aaaa"
    }
  },
  {
    content: {
      id: "07d9i3e8-6h0e-9e3g-1f87-7g8a9b0c1d07",
      title: "إطار عمل لبناء منتجات رقمية ناجحة",
      details:
        "خطوات عملية من البحث عن المشكلة إلى إطلاق المنتج وقياس مؤشرات الأداء الرئيسية (KPIs).",
      dateCreate: "2025-09-08T11:22:00.000Z",
      userId: "u7-9f3g4h5i-7777-aaaa-bbbb-cccc7777dddd",
      urlImage: "/images/product-framework.jpg",
      categoryId: "c-77777777-8888-9999-aaaa-bbbbbbbbb707",
      dateUpdate: "2025-09-08T11:22:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 310,
      likeCount: 64,
      commentCount: 7,
      notLikeCount: 0
    },
    myInterActive: {
      isLike: true,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u7-9f3g4h5i-7777-aaaa-bbbb-cccc7777dddd",
      userName: "omar_pm",
      lastName: "الجميل",
      firstName: "عمر",
      urlImage: "/avatars/omar.png",
      details: "مدير منتجات رقمي بخبرة 7 سنوات"
    },
    category: {
      id: "c-77777777-8888-9999-aaaa-bbbbbbbbb707",
      title: "ريادة الأعمال",
      description: "مقالات وموارد لروّاد الأعمال والمؤسسين",
      icon: "startup",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2024-12-12T09:00:00.000Z",
      userCreated: "u7-9f3g4h5i-7777-aaaa-bbbb-cccc7777dddd"
    }
  },
  {
    content: {
      id: "18e0j4f9-7i1f-0f4h-2g98-8h9a0b1c2e08",
      title: "مبادئ تصميم واجهات المستخدم الحديثة",
      details:
        "أُسس تصميم واجهات مستخدم بسيطة وفعّالة مع أمثلة على التدرّج اللوني والطباعة وتجربة المستخدم (UX).",
      dateCreate: "2025-09-06T09:00:00.000Z",
      userId: "u8-0g4h5i6j-8888-bbbb-cccc-dddd8888eeee",
      urlImage: "/images/ui-design-principles.jpg",
      categoryId: "c-88888888-9999-aaaa-bbbb-cccccccccc08",
      dateUpdate: "2025-09-06T09:00:00.000Z",
      code: "research"
    },
    interactiveCounts: {
      showCount: 285,
      likeCount: 58,
      commentCount: 6,
      notLikeCount: 1
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u8-0g4h5i6j-8888-bbbb-cccc-dddd8888eeee",
      userName: "salma_ui",
      lastName: "العلي",
      firstName: "سلمى",
      urlImage: "/avatars/salma.png",
      details: "مصممة واجهات ومهتمة بتجربة المستخدم"
    },
    category: {
      id: "c-88888888-9999-aaaa-bbbb-cccccccccc08",
      title: "تصميم",
      description: "مقالات ودروس عن التصميم والـUX/UI",
      icon: "design",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-01-18T08:30:00.000Z",
      userCreated: "u8-0g4h5i6j-8888-bbbb-cccc-dddd8888eeee"
    }
  },
  {
    content: {
      id: "29f1k5g0-8j2g-1g5i-3h09-9i0b1c2d3f09",
      title: "أفضل ممارسات أمن التطبيقات في 2025",
      details:
        "مراجعة لأهم ممارسات حماية التطبيقات من الثغرات الشائعة وكيفية إعداد عمليات فحص الأمان المستمرة.",
      dateCreate: "2025-09-04T15:40:00.000Z",
      userId: "u9-1h5i6j7k-9999-cccc-dddd-eeee9999ffff",
      urlImage: "/images/app-security.jpg",
      categoryId: "c-99999999-aaaa-bbbb-cccc-dddddddddd09",
      dateUpdate: "2025-09-04T15:40:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 1500,
      likeCount: 410,
      commentCount: 52,
      notLikeCount: 9
    },
    myInterActive: {
      isLike: true,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u9-1h5i6j7k-9999-cccc-dddd-eeee9999ffff",
      userName: "ahmed_sec",
      lastName: "الهاشمي",
      firstName: "أحمد",
      urlImage: "/avatars/ahmed.png",
      details: "خبير أمن معلومات ومهاجم أخلاقي"
    },
    category: {
      id: "c-99999999-aaaa-bbbb-cccc-dddddddddd09",
      title: "أمن المعلومات",
      description: "أخبار ونصائح حول حماية البيانات وتأمين الأنظمة",
      icon: "lock",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2024-11-30T12:00:00.000Z",
      userCreated: "u9-1h5i6j7k-9999-cccc-dddd-eeee9999ffff"
    }
  },
  {
    content: {
      id: "3af2l6h1-9k3h-2h6j-4i10-0j1c2d3e4g10",
      title: "حالة سوق العمل في تكنولوجيا المعلومات 2025",
      details:
        "تحليل للوظائف الأكثر طلبًا في قطاع تكنولوجيا المعلومات ونصائح للترقي المهني وتعلّم المهارات المطلوبة.",
      dateCreate: "2025-08-30T10:00:00.000Z",
      userId: "u10-2i6j7k8l-0000-1111-2222-gggg0000hhhh",
      urlImage: "/images/it-job-market.jpg",
      categoryId: "c-11112222-3333-4444-5555-666677777710",
      dateUpdate: "2025-08-30T10:00:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 2100,
      likeCount: 520,
      commentCount: 88,
      notLikeCount: 14
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u10-2i6j7k8l-0000-1111-2222-gggg0000hhhh",
      userName: "fatima_career",
      lastName: "حمودي",
      firstName: "فاطمة",
      urlImage: "/avatars/fatima.png",
      details: "مستشارة مهنية في مجال التقنية"
    },
    category: {
      id: "c-11112222-3333-4444-5555-666677777710",
      title: "وظائف",
      description: "مواضيع وفرص العمل والنصائح المهنية",
      icon: "briefcase",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-04-01T09:15:00.000Z",
      userCreated: "u10-2i6j7k8l-0000-1111-2222-gggg0000hhhh"
    }
  },
  {
    content: {
      id: "4bg3m7i2-0l4i-3i7k-5j21-1k2d3e4f5h11",
      title: "تعلّم React خطوة بخطوة للمبتدئين",
      details:
        "سلسلة دروس مبسطة لتعلم React من الأساسيات إلى إنشاء أول تطبيق تفاعلي.",
      dateCreate: "2025-08-25T13:30:00.000Z",
      userId: "u11-3j7k8l9m-1111-2222-3333-iiii1111jjjj",
      urlImage: "/images/learn-react.jpg",
      categoryId: "c-11111111-2222-3333-4444-555555555501",
      dateUpdate: "2025-08-25T13:30:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 860,
      likeCount: 220,
      commentCount: 30,
      notLikeCount: 3
    },
    myInterActive: {
      isLike: true,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u11-3j7k8l9m-1111-2222-3333-iiii1111jjjj",
      userName: "karim_frontend",
      lastName: "الحسني",
      firstName: "كريم",
      urlImage: "/avatars/karim.png",
      details: "مطور واجهات أمامية ومتحدث تقني"
    },
    category: {
      id: "c-11111111-2222-3333-4444-555555555501",
      title: "البرمجة",
      description: "مقالات ودروس حول لغات البرمجة وأطر العمل",
      icon: "code",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-08-01T08:00:00.000Z",
      userCreated: "u1-3f9a2b7c-1111-4444-8888-aaaa1111bbbb"
    }
  },
  {
    content: {
      id: "5ch4n8j3-1m5j-4j8l-6k32-2l3e4f5g6i12",
      title: "تحسين قواعد البيانات لأداء أعلى",
      details:
        "نصائح عملية لتحسين استعلامات SQL وبنية قواعد البيانات لزيادة سرعة التطبيقات.",
      dateCreate: "2025-08-20T09:10:00.000Z",
      userId: "u12-4k8l9m0n-2222-3333-4444-jjjj2222kkkk",
      urlImage: "/images/db-performance.jpg",
      categoryId: "c-22223333-4444-5555-6666-777788889912",
      dateUpdate: "2025-08-20T09:10:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 480,
      likeCount: 102,
      commentCount: 11,
      notLikeCount: 0
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u12-4k8l9m0n-2222-3333-4444-jjjj2222kkkk",
      userName: "yousef_db",
      lastName: "المرعي",
      firstName: "يوسف",
      urlImage: "/avatars/yousef.png",
      details: "مهندس قواعد بيانات بخبرة واسعة"
    },
    category: {
      id: "c-22223333-4444-5555-6666-777788889912",
      title: "قواعد البيانات",
      description: "مقالات وأدوات لإدارة وتحسين قواعد البيانات",
      icon: "database",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2024-09-05T10:00:00.000Z",
      userCreated: "u12-4k8l9m0n-2222-3333-4444-jjjj2222kkkk"
    }
  },
  {
    content: {
      id: "6di5o9k4-2n6k-5k9m-7l43-3m4f5g6h7j13",
      title: "التحديات الأخلاقية للذكاء الاصطناعي",
      details:
        "مقال يتناول المسؤولية والشفافية والتحيّز في أنظمة الذكاء الاصطناعي وكيفية معالجتها.",
      dateCreate: "2025-08-15T17:20:00.000Z",
      userId: "u13-5l9m0n1o-3333-4444-5555-kkkk3333llll",
      urlImage: "/images/ai-ethics.jpg",
      categoryId: "c-22222222-3333-4444-5555-666666666602",
      dateUpdate: "2025-08-15T17:20:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 1250,
      likeCount: 310,
      commentCount: 65,
      notLikeCount: 10
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u13-5l9m0n1o-3333-4444-5555-kkkk3333llll",
      userName: "layth_ai",
      lastName: "النجار",
      firstName: "ليث",
      urlImage: "/avatars/layth.png",
      details: "باحث مهتم بأخلاقيات التكنولوجيا"
    },
    category: {
      id: "c-22222222-3333-4444-5555-666666666602",
      title: "الذكاء الاصطناعي",
      description: "أحدث الأبحاث والتطبيقات في الذكاء الاصطناعي",
      icon: "ai",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-07-15T09:30:00.000Z",
      userCreated: "u2-4a8b9c0d-2222-5555-9999-bbbb2222cccc"
    }
  },
  {
    content: {
      id: "7ej6p0l5-3o7l-6l0n-8m54-4n5g6h7i8k14",
      title: "دليل إنشاء متجر إلكتروني ناجح",
      details:
        "خطوات عملية لإنشاء متجر إلكتروني متكامل من اختيار المنصة وحتى تحسين التحويلات والمبيعات.",
      dateCreate: "2025-08-10T14:45:00.000Z",
      userId: "u14-6m0n1o2p-4444-5555-6666-llll4444mmmm",
      urlImage: "/images/ecommerce-guide.jpg",
      categoryId: "c-66666666-7777-8888-9999-aaaaaaaaa606",
      dateUpdate: "2025-08-10T14:45:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 530,
      likeCount: 112,
      commentCount: 14,
      notLikeCount: 2
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u14-6m0n1o2p-4444-5555-6666-llll4444mmmm",
      userName: "hana_ecom",
      lastName: "الزهراني",
      firstName: "هناء",
      urlImage: "/avatars/hana.png",
      details: "خبيرة تجارة إلكترونية واستشارات متاجر"
    },
    category: {
      id: "c-66666666-7777-8888-9999-aaaaaaaaa606",
      title: "التسويق",
      description: "استراتيجيات وأدوات التسويق الرقمي",
      icon: "megaphone",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-02-05T13:10:00.000Z",
      userCreated: "u6-8e2f3g4h-6666-9999-dddd-ffff6666aaaa"
    }
  },
  {
    content: {
      id: "8fk7q1m6-4p8m-7m1o-9n65-5o6h7i8j9l15",
      title: "الكشف عن مواصفات لغة C# الجديدة",
      details:
        "نظرة عامة على الميزات والخصائص الجديدة في إصدارات C# وكيفية الاستفادة منها في المشاريع الحديثة.",
      dateCreate: "2025-07-30T10:00:00.000Z",
      userId: "u15-7n1o2p3q-5555-6666-7777-mmmm5555nnnn",
      urlImage: "/images/csharp-features.jpg",
      categoryId: "c-11111111-2222-3333-4444-555555555501",
      dateUpdate: "2025-07-30T10:00:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 760,
      likeCount: 180,
      commentCount: 20,
      notLikeCount: 3
    },
    myInterActive: {
      isLike: true,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u15-7n1o2p3q-5555-6666-7777-mmmm5555nnnn",
      userName: "hassan_csharp",
      lastName: "حسن",
      firstName: "حسن",
      urlImage: "/avatars/hassan.png",
      details: "مهندس برمجيات متخصص في .NET"
    },
    category: {
      id: "c-11111111-2222-3333-4444-555555555501",
      title: "البرمجة",
      description: "مقالات ودروس حول لغات البرمجة وأطر العمل",
      icon: "code",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-08-01T08:00:00.000Z",
      userCreated: "u1-3f9a2b7c-1111-4444-8888-aaaa1111bbbb"
    }
  },
  {
    content: {
      id: "9gl8r2n7-5q9n-8n2p-0o76-6p7i8j9k0m16",
      title: "حالات عملية لاستخدام تعلم الآلة في الأعمال",
      details:
        "أمثلة تطبيقية لكيفية توظيف نماذج تعلم الآلة لزيادة الكفاءة وتحسين اتخاذ القرار في الشركات.",
      dateCreate: "2025-07-20T09:30:00.000Z",
      userId: "u16-8o2p3q4r-6666-7777-8888-nnnn6666oooo",
      urlImage: "/images/ml-business-cases.jpg",
      categoryId: "c-22222222-3333-4444-5555-666666666602",
      dateUpdate: "2025-07-20T09:30:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 1320,
      likeCount: 400,
      commentCount: 72,
      notLikeCount: 11
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: true
    },
    shortDetailsUser: {
      id: "u16-8o2p3q4r-6666-7777-8888-nnnn6666oooo",
      userName: "asmaa_ml",
      lastName: "الهادي",
      firstName: "أسماء",
      urlImage: "/avatars/asmaa.png",
      details: "مهندسة بيانات ومحللة أعمال"
    },
    category: {
      id: "c-22222222-3333-4444-5555-666666666602",
      title: "الذكاء الاصطناعي",
      description: "أحدث الأبحاث والتطبيقات في الذكاء الاصطناعي",
      icon: "ai",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-07-15T09:30:00.000Z",
      userCreated: "u2-4a8b9c0d-2222-5555-9999-bbbb2222cccc"
    }
  },
  {
    content: {
      id: "a0h9s3o8-6r0o-9o3q-1p87-7q8j9k0l1n17",
      title: "كيفية إدارة فرق التطوير عن بعد",
      details:
        "أدوات وممارسات لبناء فرق فعّالة عن بعد، تشمل التواصل وإدارة المهام ومؤشرات الأداء.",
      dateCreate: "2025-07-10T11:00:00.000Z",
      userId: "u17-9p3q4r5s-7777-8888-9999-oooo7777pppp",
      urlImage: "/images/remote-teams.jpg",
      categoryId: "c-11112222-3333-4444-5555-666677777710",
      dateUpdate: "2025-07-10T11:00:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 410,
      likeCount: 95,
      commentCount: 8,
      notLikeCount: 1
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u17-9p3q4r5s-7777-8888-9999-oooo7777pppp",
      userName: "nadia_pm",
      lastName: "نجار",
      firstName: "نادية",
      urlImage: "/avatars/nadia.png",
      details: "قائدة فرق تقنية ومتخصصة بالعمل عن بُعد"
    },
    category: {
      id: "c-11112222-3333-4444-5555-666677777710",
      title: "وظائف",
      description: "مواضيع وفرص العمل والنصائح المهنية",
      icon: "briefcase",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-04-01T09:15:00.000Z",
      userCreated: "u10-2i6j7k8l-0000-1111-2222-gggg0000hhhh"
    }
  },
  {
    content: {
      id: "b1i0t4p9-7s1p-0p4r-2q98-8r9k0l1m2o18",
      title: "أدوات لكتابة المحتوى التقني بسرعة",
      details:
        "قائمة بأدوات وتطبيقات تساعد الكُتّاب التقنيين على إنتاج محتوى عالي الجودة بشكل أسرع.",
      dateCreate: "2025-06-25T08:20:00.000Z",
      userId: "u18-0q4r5s6t-8888-9999-aaaa-bbbb8888cccc",
      urlImage: "/images/content-tools.jpg",
      categoryId: "c-44444444-5555-6666-7777-888888888804",
      dateUpdate: "2025-06-25T08:20:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 260,
      likeCount: 45,
      commentCount: 5,
      notLikeCount: 0
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u18-0q4r5s6t-8888-9999-aaaa-bbbb8888cccc",
      userName: "mona_writer",
      lastName: "الطه",
      firstName: "منى",
      urlImage: "/avatars/mona.png",
      details: "كاتبة محتوى تقنيّة ومدرّبة"
    },
    category: {
      id: "c-44444444-5555-6666-7777-888888888804",
      title: "التعليم",
      description: "موارد ومقالات حول التعليم والتعلّم عن بعد",
      icon: "book",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-05-10T07:45:00.000Z",
      userCreated: "u4-6c0d1e2f-4444-7777-bbbb-eeee4444ffff"
    }
  },
  {
    content: {
      id: "c2j1u5q0-8t2q-1q5s-3r09-9s0l1m2n3p19",
      title: "تخفيف استهلاك الطاقة في تطبيقات الجوال",
      details:
        "تقنيات برمجية لتقليل استهلاك البطارية والموارد في تطبيقات الهواتف المحمولة دون التأثير على الأداء.",
      dateCreate: "2025-06-10T07:00:00.000Z",
      userId: "u19-1r5s6t7u-9999-aaaa-bbbb-cccc9999dddd",
      urlImage: "/images/mobile-energy.jpg",
      categoryId: "c-33333333-4444-5555-6666-777777777703",
      dateUpdate: "2025-06-10T07:00:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 350,
      likeCount: 70,
      commentCount: 9,
      notLikeCount: 2
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u19-1r5s6t7u-9999-aaaa-bbbb-cccc9999dddd",
      userName: "mohrawi_mobile",
      lastName: "محراوي",
      firstName: "سعيد",
      urlImage: "/avatars/saeed.png",
      details: "مطور تطبيقات جوال ومهتم بأداء التطبيقات"
    },
    category: {
      id: "c-33333333-4444-5555-6666-777777777703",
      title: "الطاقة النظيفة",
      description: "الأخبار والمقالات حول الطاقة المتجددة والاستدامة",
      icon: "sun",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-06-20T11:00:00.000Z",
      userCreated: "u3-5b9c0d1e-3333-6666-aaaa-cccc3333dddd"
    }
  },
  {
    content: {
      id: "d3k2v6r1-9u3r-2r6t-4s10-0t1m2n3o4q20",
      title: "كيف تكتب سيرة ذاتية مميزة للمطورين",
      details:
        "نصائح عملية لصياغة سيرة ذاتية تقنية تبرز الخبرات والمشاريع بطريقة احترافية.",
      dateCreate: "2025-05-30T10:30:00.000Z",
      userId: "u20-2s6t7u8v-0000-1111-2222-pppp0000qqqq",
      urlImage: "/images/dev-cv.jpg",
      categoryId: "c-11112222-3333-4444-5555-666677777710",
      dateUpdate: "2025-05-30T10:30:00.000Z",
      code: "post"
    },
    interactiveCounts: {
      showCount: 190,
      likeCount: 40,
      commentCount: 4,
      notLikeCount: 0
    },
    myInterActive: {
      isLike: false,
      isNotLike: false,
      isLove: false
    },
    shortDetailsUser: {
      id: "u20-2s6t7u8v-0000-1111-2222-pppp0000qqqq",
      userName: "saleh_cv",
      lastName: "صالح",
      firstName: "سالم",
      urlImage: "/avatars/saleh.png",
      details: "مستشار مهني ومراجع سير ذاتية"
    },
    category: {
      id: "c-11112222-3333-4444-5555-666677777710",
      title: "وظائف",
      description: "مواضيع وفرص العمل والنصائح المهنية",
      icon: "briefcase",
      urlImage: null,
      categoryMainId: "",
      dateCreated: "2025-04-01T09:15:00.000Z",
      userCreated: "u10-2i6j7k8l-0000-1111-2222-gggg0000hhhh"
    }
  }
];

// Mock Settings
export const mockSettings: Settings = {
  limits: {
    maxCommentLength: 500,
    maxTitleLength: 200,
    maxTags: 20,
  },
  site: {
    name: "FutureSpace",
    logoUrl: "/futuristic-logo-icon.jpg",
  },
}

// Mock Types
export const mockTypes = [
  { title: "منشور", code: "post" },
  { title: "مقالات", code: "post1" },
  { title: "بحث", code: "research" },
]

// Mock Sorting Options
export const mockSortingOptions = [
  { title: "الأحدث", code: "Newest" },
  { title: "الأكثر مشاهدة", code: "MostViewed" },
  { title: "الأكثر إعجاباً", code: "MostLiked" },
  { title: "الأكثر تعليقاً", code: "MostCommented" },
]

// In-memory state for mock interactions
export const mockState = {
  content: [...mockContent],
  currentUser: {
    id: "current-user-123",
    isLoggedIn: true,
  },
}
