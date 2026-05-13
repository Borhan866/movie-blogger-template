// ডাটা স্টোরেজ ম্যানেজমেন্ট
const STORAGE_KEY = 'movieBloggerPosts';
const CATEGORIES = {
    bollywood: 'বলিউড',
    hollywood: 'হলিউড',
    telugu: 'তেলুগু',
    tamil: 'তামিল',
    webseries: 'ওয়েব সিরিজ',
    tvshow: 'টিভি শো'
};

// সব এলিমেন্ট সিলেক্ট করা
const createBtn = document.getElementById('createBtn');
const createModal = document.getElementById('createModal');
const detailsModal = document.getElementById('detailsModal');
const closeCreateModal = document.getElementById('closeCreateModal');
const closeModal = document.getElementById('closeModal');
const postForm = document.getElementById('postForm');
const cancelBtn = document.getElementById('cancelBtn');
const postsGrid = document.getElementById('postsGrid');
const emptyState = document.getElementById('emptyState');
const categoryBtns = document.querySelectorAll('.category-btn');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const postDetailsDiv = document.getElementById('postDetails');

let currentCategory = 'all';
let editingPostId = null;

// ডাটাবেজ থেকে পোস্ট পান
function getPosts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// পোস্ট সেভ করুন
function savePosts(posts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// নতুন পোস্ট যোগ করুন
function addPost(postData) {
    const posts = getPosts();
    const newPost = {
        id: Date.now(),
        ...postData,
        createdAt: new Date().toISOString()
    };
    posts.push(newPost);
    savePosts(posts);
    return newPost;
}

// পোস্ট আপডেট করুন
function updatePost(id, postData) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index !== -1) {
        posts[index] = { ...posts[index], ...postData };
        savePosts(posts);
    }
}

// পোস্ট ডিলিট করুন
function deletePost(id) {
    if (confirm('আপনি কি এই পোস্টটি ডিলিট করতে চান?')) {
        const posts = getPosts().filter(p => p.id !== id);
        savePosts(posts);
        renderPosts();
        detailsModal.classList.remove('active');
    }
}

// পোস্ট রেন্ডার করুন
function renderPosts() {
    const posts = getPosts();
    const filteredPosts = currentCategory === 'all' 
        ? posts 
        : posts.filter(p => p.category === currentCategory);

    postsGrid.innerHTML = '';

    if (filteredPosts.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    filteredPosts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="post-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22250%22 height=%22200%22%3E%3Crect fill=%22%23ccc%22 width=%22250%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3Eছবি লোড হয়নি%3C/text%3E%3C/svg%3E'">
            <div class="post-content">
                <span class="post-category">${CATEGORIES[post.category]}</span>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-description">${post.description}</p>
                <div class="post-meta">
                    <span class="post-rating">⭐ ${post.rating}/5</span>
                    <span>${post.releaseYear}</span>
                </div>
            </div>
        `;

        postCard.addEventListener('click', () => showPostDetails(post));
        postsGrid.appendChild(postCard);
    });
}

// পোস্ট ডিটেইলস দেখান
function showPostDetails(post) {
    const categoryName = CATEGORIES[post.category] || post.category;
    const createdDate = new Date(post.createdAt).toLocaleDateString('bn-BD');

    postDetailsDiv.innerHTML = `
        <img src="${post.image}" alt="${post.title}" class="post-details-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22%3E%3Crect fill=%22%23ccc%22 width=%22600%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2232%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3Eছবি লোড হয়নি%3C/text%3E%3C/svg%3E'">
        <h2>${post.title}</h2>
        <div class="post-details-meta">
            <div class="post-details-meta-item">
                <span class="post-details-meta-label">ক্যাটাগরি</span>
                <span class="post-details-meta-value">${categoryName}</span>
            </div>
            <div class="post-details-meta-item">
                <span class="post-details-meta-label">রেটিং</span>
                <span class="post-details-meta-value">⭐ ${post.rating}/5</span>
            </div>
            <div class="post-details-meta-item">
                <span class="post-details-meta-label">রিলিজ সাল</span>
                <span class="post-details-meta-value">${post.releaseYear}</span>
            </div>
            <div class="post-details-meta-item">
                <span class="post-details-meta-label">প্রকাশ তারিখ</span>
                <span class="post-details-meta-value">${createdDate}</span>
            </div>
        </div>
        <div class="post-details-description">${post.description}</div>
        <div class="post-details-actions">
            <button class="btn btn-edit" onclick="editPost(${post.id})">✏️ এডিট করুন</button>
            <button class="btn btn-danger" onclick="deletePost(${post.id})">🗑️ ডিলিট করুন</button>
        </div>
    `;

    detailsModal.classList.add('active');
}

// পোস্ট এডিট করুন
function editPost(id) {
    const posts = getPosts();
    const post = posts.find(p => p.id === id);
    
    if (post) {
        editingPostId = id;
        document.getElementById('modalTitle').textContent = 'পোস্ট এডিট করুন';
        document.getElementById('title').value = post.title;
        document.getElementById('category').value = post.category;
        document.getElementById('description').value = post.description;
        document.getElementById('image').value = post.image;
        document.getElementById('rating').value = post.rating;
        document.getElementById('releaseYear').value = post.releaseYear;
        
        imagePreview.src = post.image;
        imagePreview.style.display = 'block';
        
        detailsModal.classList.remove('active');
        createModal.classList.add('active');
    }
}

// ইমেজ প্রিভিউ
imageInput.addEventListener('change', (e) => {
    const url = e.target.value;
    if (url) {
        imagePreview.src = url;
        imagePreview.style.display = 'block';
        imagePreview.onerror = () => {
            imagePreview.style.display = 'none';
        };
    }
});

// ফর্ম সাবমিট
postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const postData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value,
        rating: parseFloat(document.getElementById('rating').value),
        releaseYear: parseInt(document.getElementById('releaseYear').value)
    };

    if (editingPostId) {
        updatePost(editingPostId, postData);
        editingPostId = null;
        document.getElementById('modalTitle').textContent = 'নতুন পোস্ট তৈরি করুন';
    } else {
        addPost(postData);
    }

    renderPosts();
    createModal.classList.remove('active');
    postForm.reset();
    imagePreview.style.display = 'none';
});

// মোডাল খোলা/বন্ধ করা
createBtn.addEventListener('click', () => {
    editingPostId = null;
    document.getElementById('modalTitle').textContent = 'নতুন পোস্ট তৈরি করুন';
    postForm.reset();
    imagePreview.style.display = 'none';
    createModal.classList.add('active');
});

closeCreateModal.addEventListener('click', () => {
    createModal.classList.remove('active');
    editingPostId = null;
});

closeModal.addEventListener('click', () => {
    detailsModal.classList.remove('active');
});

cancelBtn.addEventListener('click', () => {
    createModal.classList.remove('active');
    editingPostId = null;
});

// মোডাল বাইরে ক্লিক করলে বন্ধ হোক
window.addEventListener('click', (e) => {
    if (e.target === createModal) {
        createModal.classList.remove('active');
        editingPostId = null;
    }
    if (e.target === detailsModal) {
        detailsModal.classList.remove('active');
    }
});

// ক্যাটাগরি ফিল্টারিং
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        renderPosts();
    });
});

// পেজ লোড হলে পোস্ট রেন্ডার করুন
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
});