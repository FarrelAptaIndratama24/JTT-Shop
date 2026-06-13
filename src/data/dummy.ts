import { Product, User, Comment, CommunityPost } from '../types';

export const DUMMY_USERS: Record<string, User> = {
  'u1': { id: 'u1', name: 'Alex Player', avatar: 'https://i.pravatar.cc/150?u=1', role: 'user', created_at: '2026-01-10T10:00:00Z' },
  'u2': { id: 'u2', name: 'JTT Official', avatar: 'https://i.pravatar.cc/150?u=2', role: 'admin', created_at: '2026-01-01T10:00:00Z' },
  'u3': { id: 'u3', name: 'Pro Snooker', avatar: 'https://i.pravatar.cc/150?u=3', role: 'user', created_at: '2026-02-15T10:00:00Z' },
  'u4': { id: 'u4', name: 'Cue Master', avatar: 'https://i.pravatar.cc/150?u=4', role: 'user', created_at: '2026-03-20T10:00:00Z' },
};

export const DUMMY_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Predator P3 REVO',
    description: 'The ultimate professional cue featuring REVO carbon fiber composite shaft technology. Delivers unprecedented precision, performance, and durability.',
    price: 12500000,
    rating: 4.9,
    reviewsCount: 128,
    image: '/images/predator-panther.jpg',
    category: 'Carbon',
    specs: {
      weight: '19 oz',
      length: '58 inch',
      tip: 'Predator Victory Soft',
      joint: 'Uni-Loc',
      shaft: 'REVO 12.4mm'
    },
    features: ['REVO Shaft', 'P3 Technology', 'Vibration dampening', 'Carbon Fiber Collar'],
    stock: 5,
    created_at: '2026-04-01T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Mezz Axi-153',
    description: 'Classic craftsmanship meets modern performance. Precision engineered for perfect balance and exceptional hit feel.',
    price: 8500000,
    rating: 4.8,
    reviewsCount: 95,
    image: '/images/mezz-cues.jpg',
    category: 'Wood',
    specs: {
      weight: '19.5 oz',
      length: '58 inch',
      tip: 'Kamui Original Medium',
      joint: 'Wavy',
      shaft: 'WX700'
    },
    features: ['Birdseye Maple', 'WX700 Shaft', 'Irish Linen Wrap', 'Aegis Rings'],
    stock: 12,
    created_at: '2026-04-05T10:00:00Z'
  },
  {
    id: 'p3',
    name: 'Cuetec Cynergy 12.9',
    description: 'High-performance carbon fiber cue trusted by champions worldwide. Features a multi-directional carbon fiber shaft.',
    price: 9800000,
    rating: 4.7,
    reviewsCount: 210,
    image: '/images/revo-12-5.jpg',
    category: 'Carbon',
    specs: {
      weight: '19 oz',
      length: '58 inch',
      tip: 'Sniper',
      joint: '3/8 x 14',
      shaft: 'Cynergy 12.9mm'
    },
    features: ['Cynergy Shaft', 'True-Wood finish', 'Acueweight system', 'Polyurethane Wrap'],
    stock: 8,
    created_at: '2026-04-10T10:00:00Z'
  },
  {
    id: 'p4',
    name: 'Predator BK-Rush Break Cue',
    description: 'The BK-Rush is the ultimate break cue, featuring the BK-Rush carbon fiber shaft designed to transfer more power with less effort.',
    price: 11000000,
    rating: 5.0,
    reviewsCount: 85,
    image: '/images/predator-bk-rush.jpg',
    category: 'Break',
    specs: {
      weight: '18 oz',
      length: '58 inch',
      tip: 'BK Hybrid Tip',
      joint: 'Uni-Loc Steel',
      shaft: 'BK-Rush Carbon'
    },
    features: ['BK-Rush Carbon Shaft', 'Sports Wrap', 'Four-Piece Butt Construction'],
    stock: 3,
    created_at: '2026-04-12T10:00:00Z'
  },
  {
    id: 'p5',
    name: 'Predator REVO 12.5mm Shaft',
    description: 'Stand-alone Predator REVO carbon fiber shaft. Low deflection, extreme accuracy, and seamless power transfer.',
    price: 6500000,
    rating: 4.9,
    reviewsCount: 320,
    image: '/images/carbon-12-9.jpg',
    category: 'Shaft',
    specs: {
      weight: '4 oz',
      length: '29 inch',
      tip: 'Predator Victory Soft',
      joint: 'Uni-Loc Quick Release',
      shaft: 'REVO 12.5mm'
    },
    features: ['Aerospace Carbon Fiber', 'Vault Plate', 'Low Deflection'],
    stock: 15,
    created_at: '2026-04-15T10:00:00Z'
  }
];

export const DUMMY_COMMENTS: Comment[] = [
  {
    id: 'c1',
    product_id: 'p1',
    user_id: 'u1',
    user: DUMMY_USERS['u1'],
    content: 'Best cue I have ever used. The low deflection is unreal and the hit feels solid.',
    created_at: '2026-05-01T10:00:00Z',
    replies: [
      {
        id: 'r1',
        parent_id: 'c1',
        user_id: 'u2',
        user: DUMMY_USERS['u2'],
        content: 'Thank you Alex! Enjoy the game.',
        created_at: '2026-05-01T11:00:00Z',
        replies: []
      }
    ]
  },
  {
    id: 'c2',
    product_id: 'p1',
    user_id: 'u3',
    user: DUMMY_USERS['u3'],
    content: 'Is this available in 18.5oz?',
    created_at: '2026-05-02T15:30:00Z',
    replies: [
      {
        id: 'r2',
        parent_id: 'c2',
        user_id: 'u2',
        user: DUMMY_USERS['u2'],
        content: 'Yes, we can adjust the weight bolt before shipping. Just let us know in the order notes!',
        created_at: '2026-05-02T16:00:00Z',
        replies: []
      }
    ]
  }
];

export const DUMMY_POSTS: CommunityPost[] = [
  {
    id: 'post1',
    user_id: 'u3',
    user: DUMMY_USERS['u3'],
    title: 'Tips for improving bridge stability?',
    content: 'I have been playing for 2 years but still struggle with long shots due to my bridge. Any advice on keeping the bridge hand rock solid, especially on open bridges?',
    created_at: '2026-05-08T14:30:00Z',
    likes: 45,
    comments_count: 12,
    tags: ['Tips', 'Beginner', 'Technique']
  },
  {
    id: 'post2',
    user_id: 'u4',
    user: DUMMY_USERS['u4'],
    title: 'Carbon vs Wood: A honest review after 1 year',
    content: 'Switched to a REVO shaft last year. The consistency is great, but I do miss the feedback of my old maple shaft on soft draw shots. What are your thoughts?',
    created_at: '2026-05-09T09:15:00Z',
    likes: 128,
    comments_count: 34,
    tags: ['Discussion', 'Gear', 'Review']
  }
];
