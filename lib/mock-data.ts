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
