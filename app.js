// app.js - LecturesBase (Полнофункциональная версия)
class LecturesBase {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('lecturesbase_users')) || this.initializeDefaultUsers();
        this.materials = JSON.parse(localStorage.getItem('lecturesbase_materials')) || this.initializeDefaultMaterials();
        this.downloads = JSON.parse(localStorage.getItem('lecturesbase_downloads')) || [];
        this.init();
    }

    initializeDefaultUsers() {
        const defaultUsers = [
            {
                uid: "1",
                email: "student@lecturesbase.ru",
                password: "123456",
                role: "student",
                name: "Иванов Алексей",
                group: "ИС-21",
                createdAt: new Date(),
                isActive: true
            },
            {
                uid: "2",
                email: "teacher@lecturesbase.ru",
                password: "123456",
                role: "teacher",
                name: "Петрова Мария Владимировна",
                group: null,
                createdAt: new Date(),
                isActive: true
            },
            {
                uid: "3",
                email: "admin@lecturesbase.ru",
                password: "123456",
                role: "admin",
                name: "Сидоров Андрей Петрович",
                group: null,
                createdAt: new Date(),
                isActive: true
            }
        ];
        this.saveUsers();
        return defaultUsers;
    }

    initializeDefaultMaterials() {
        const defaultMaterials = [
            {
                id: "1",
                title: "Введение в программирование",
                subject: "Программирование",
                faculty: "it",
                type: "lecture",
                description: "Основные понятия и принципы программирования. Языки программирования, переменные, операторы, структуры данных.",
                fileName: "introduction_to_programming.pdf",
                fileSize: 2540000,
                fileUrl: "#",
                teacherId: "2",
                teacherName: "Петрова Мария Владимировна",
                groups: ["ИС-21", "ИС-22"],
                accessibleTo: "groups",
                createdAt: new Date('2024-01-15'),
                downloads: 12
            },
            {
                id: "2",
                title: "Линейная алгебра и матрицы",
                subject: "Математика",
                faculty: "it",
                type: "presentation",
                description: "Матрицы, векторы, системы линейных уравнений. Основные теоремы и методы решения. Практические примеры.",
                fileName: "linear_algebra_matrices.pptx",
                fileSize: 1850000,
                fileUrl: "#",
                teacherId: "2",
                teacherName: "Петрова Мария Владимировна",
                groups: [],
                accessibleTo: "all",
                createdAt: new Date('2024-01-10'),
                downloads: 8
            },
            {
                id: "3",
                title: "Основы экономической теории",
                subject: "Экономика",
                faculty: "economics",
                type: "lecture",
                description: "Введение в экономическую теорию. Спрос, предложение, рыночное равновесие. Микро- и макроэкономика.",
                fileName: "economics_theory_basics.pdf",
                fileSize: 3120000,
                fileUrl: "#",
                teacherId: "2",
                teacherName: "Петрова Мария Владимировна",
                groups: ["ЭК-21", "ЭК-22"],
                accessibleTo: "groups",
                createdAt: new Date('2024-01-12'),
                downloads: 15
            },
            {
                id: "4",
                title: "История государства и права",
                subject: "Право",
                faculty: "law",
                type: "methodology",
                description: "Развитие правовых систем от древности до наших дней. Основные правовые семьи и их особенности.",
                fileName: "law_history_methodology.docx",
                fileSize: 890000,
                fileUrl: "#",
                teacherId: "2",
                teacherName: "Петрова Мария Владимировна",
                groups: ["ЮР-21"],
                accessibleTo: "groups",
                createdAt: new Date('2024-01-08'),
                downloads: 6
            }
        ];
        this.saveMaterials();
        return defaultMaterials;
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
        this.loadPublicMaterials();
    }

    setupEventListeners() {
        // Формы
        document.getElementById('login-form').addEventListener('submit', (e) => this.loginUser(e));
        document.getElementById('create-user-form').addEventListener('submit', (e) => this.createUser(e));
        document.getElementById('upload-material-form').addEventListener('submit', (e) => this.uploadMaterial(e));
        document.getElementById('logout-btn').addEventListener('click', (e) => this.logoutUser(e));

        // Фильтры
        document.getElementById('faculty-select').addEventListener('change', () => this.loadPublicMaterials());
        document.getElementById('subject-select').addEventListener('change', () => this.loadPublicMaterials());
        document.getElementById('type-select').addEventListener('change', () => this.loadPublicMaterials());
        document.getElementById('search-input').addEventListener('input', () => this.loadPublicMaterials());

        // Плавная прокрутка
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    checkAuthState() {
        const savedUser = localStorage.getItem('lecturesbase_currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.setupUI(this.currentUser);
        } else {
            this.setupUI(null);
        }
    }

    setupUI(user) {
        const elements = {
            adminLink: document.getElementById('admin-link'),
            teacherLink: document.getElementById('teacher-link'),
            studentLink: document.getElementById('student-link'),
            loginLink: document.getElementById('login-link'),
            logoutLink: document.getElementById('logout-link'),
            adminPanel: document.getElementById('admin-panel'),
            userName: document.getElementById('user-name')
        };

        // Скрываем все секции
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        if (user) {
            elements.loginLink.style.display = 'none';
            elements.logoutLink.style.display = 'block';
            elements.userName.textContent = user.name;

            // Показываем соответствующие роли
            elements.adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
            elements.teacherLink.style.display = user.role === 'teacher' ? 'block' : 'none';
            elements.studentLink.style.display = user.role === 'student' ? 'block' : 'none';
            elements.adminPanel.style.display = user.role === 'admin' ? 'block' : 'none';

            // Показываем нужную секцию
            this.showSection(user.role);
            
            // Загружаем данные для роли
            this.loadRoleData(user);
        } else {
            elements.loginLink.style.display = 'block';
            elements.logoutLink.style.display = 'none';
            elements.adminLink.style.display = 'none';
            elements.teacherLink.style.display = 'none';
            elements.studentLink.style.display = 'none';
            elements.adminPanel.style.display = 'none';
            this.showSection('login');
        }
    }

    showSection(section) {
        const sections = {
            admin: 'admin',
            teacher: 'teacher', 
            student: 'student',
            login: 'login'
        };

        document.querySelectorAll('.dashboard-section, .auth-section').forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = sections[section] || 'login';
        document.getElementById(targetSection).style.display = 'block';
    }

    loadRoleData(user) {
        switch(user.role) {
            case 'student':
                this.loadStudentMaterials();
                break;
            case 'teacher':
                this.loadTeacherMaterials();
                break;
            case 'admin':
                this.loadAdminPanel();
                break;
        }
    }

    loginUser(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const messageDiv = document.getElementById('auth-message');

        const user = this.users.find(u => u.email === email && u.password === password && u.isActive);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('lecturesbase_currentUser', JSON.stringify(user));
            this.setupUI(user);
            this.showNotification('Вход выполнен успешно!', 'success');
        } else {
            messageDiv.innerHTML = '<p class="error">❌ Неверный email или пароль</p>';
        }
    }

    createUser(e) {
        e.preventDefault();
        
        if (this.currentUser.role !== 'admin') {
            this.showNotification('Только администраторы могут создавать пользователей', 'error');
            return;
        }

        const email = document.getElementById('new-user-email').value;
        const password = document.getElementById('new-user-password').value;
        const role = document.getElementById('new-user-role').value;
        const name = document.getElementById('new-user-name').value;
        const group = document.getElementById('new-user-group').value;

        if (this.users.find(u => u.email === email)) {
            this.showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }

        const newUser = {
            uid: Date.now().toString(),
            email: email,
            password: password,
            role: role,
            name: name,
            group: role === 'student' ? group : null,
            createdAt: new Date(),
            isActive: true,
            createdBy: this.currentUser.uid
        };

        this.users.push(newUser);
        this.saveUsers();

        this.showNotification('Пользователь успешно создан!', 'success');
        document.getElementById('create-user-form').reset();
        this.loadAdminPanel();
    }

    uploadMaterial(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('material-file');
        const title = document.getElementById('material-title').value;
        const subject = document.getElementById('material-subject').value;
        const faculty = document.getElementById('material-faculty').value;
        const type = document.getElementById('material-type').value;
        const description = document.getElementById('material-description').value;
        const groups = document.getElementById('material-groups').value.split(',').map(g => g.trim()).filter(g => g);

        if (!fileInput.files[0]) {
            this.showNotification('Пожалуйста, выберите файл для загрузки', 'error');
            return;
        }

        const file = fileInput.files[0];
        
        // Создаем объект URL для файла (эмуляция загрузки)
        const fileUrl = URL.createObjectURL(file);

        const newMaterial = {
            id: Date.now().toString(),
            title: title,
            subject: subject,
            faculty: faculty,
            type: type,
            description: description,
            fileName: file.name,
            fileSize: file.size,
            fileUrl: fileUrl,
            teacherId: this.currentUser.uid,
            teacherName: this.currentUser.name,
            groups: groups,
            accessibleTo: groups.length > 0 ? 'groups' : 'all',
            createdAt: new Date(),
            downloads: 0
        };

        this.materials.unshift(newMaterial);
        this.saveMaterials();

        this.showNotification('Материал успешно загружен!', 'success');
        document.getElementById('upload-material-form').reset();
        this.loadTeacherMaterials();
    }

    loadStudentMaterials() {
        const studentGroup = this.currentUser.group;
        const materialsGrid = document.getElementById('student-materials');
        const materialsCount = document.getElementById('student-materials-count');
        const studentGroupElement = document.getElementById('student-group');

        studentGroupElement.textContent = studentGroup;

        const accessibleMaterials = this.materials.filter(material => {
            if (material.accessibleTo === 'all') return true;
            if (material.accessibleTo === 'groups' && material.groups.includes(studentGroup)) return true;
            return false;
        });

        materialsCount.textContent = accessibleMaterials.length;
        materialsGrid.innerHTML = '';

        if (accessibleMaterials.length === 0) {
            materialsGrid.innerHTML = this.createNoMaterialsHTML('Для вашей группы пока нет доступных материалов');
            return;
        }

        accessibleMaterials.forEach(material => {
            materialsGrid.innerHTML += this.createMaterialCard(material, true);
        });
    }

    loadTeacherMaterials() {
        const teacherMaterials = this.materials.filter(m => m.teacherId === this.currentUser.uid);
        const materialsGrid = document.getElementById('teacher-materials');
        const materialsCount = document.getElementById('teacher-materials-count');
        const downloadsCount = document.getElementById('teacher-downloads-count');

        const totalDownloads = teacherMaterials.reduce((sum, material) => sum + material.downloads, 0);

        materialsCount.textContent = teacherMaterials.length;
        downloadsCount.textContent = totalDownloads;
        materialsGrid.innerHTML = '';

        if (teacherMaterials.length === 0) {
            materialsGrid.innerHTML = this.createNoMaterialsHTML('Вы еще не загрузили ни одного материала');
            return;
        }

        teacherMaterials.forEach(material => {
            materialsGrid.innerHTML += this.createMaterialCard(material, false);
        });
    }

    loadAdminPanel() {
        const usersCount = document.getElementById('users-count');
        const materialsCount = document.getElementById('materials-count');
        const downloadsCount = document.getElementById('downloads-count');
        const usersList = document.getElementById('users-list');
        const adminMaterials = document.getElementById('admin-materials');

        const totalDownloads = this.materials.reduce((sum, material) => sum + material.downloads, 0);

        usersCount.textContent = this.users.length;
        materialsCount.textContent = this.materials.length;
        downloadsCount.textContent = totalDownloads;

        // Список пользователей
        usersList.innerHTML = '';
        this.users.forEach(user => {
            usersList.innerHTML += this.createUserCard(user);
        });

        // Все материалы
        adminMaterials.innerHTML = '';
        this.materials.forEach(material => {
            adminMaterials.innerHTML += this.createMaterialCard(material, true);
        });
    }

    loadPublicMaterials() {
        const faculty = document.getElementById('faculty-select').value;
        const subject = document.getElementById('subject-select').value;
        const type = document.getElementById('type-select').value;
        const search = document.getElementById('search-input').value.toLowerCase();
        const materialsGrid = document.getElementById('public-materials');
        const countText = document.getElementById('materials-count-text');

        const publicMaterials = this.materials.filter(material => material.accessibleTo === 'all');

        const filteredMaterials = publicMaterials.filter(material => {
            if (faculty && material.faculty !== faculty) return false;
            if (subject && material.subject.toLowerCase() !== subject.toLowerCase()) return false;
            if (type && material.type !== type) return false;
            if (search && !material.title.toLowerCase().includes(search) && 
                !material.description.toLowerCase().includes(search)) return false;
            return true;
        });

        countText.textContent = `Найдено материалов: ${filteredMaterials.length}`;
        materialsGrid.innerHTML = '';

        if (filteredMaterials.length === 0) {
            materialsGrid.innerHTML = this.createNoMaterialsHTML('Материалы не найдены');
            return;
        }

        filteredMaterials.forEach(material => {
            materialsGrid.innerHTML += this.createMaterialCard(material, true);
        });
    }

    createMaterialCard(material, showDownload = true) {
        const icon = this.getMaterialIcon(material.type);
        const canDownload = showDownload && this.currentUser;

        return `
            <div class="material-card">
                <div class="card-header">
                    <h3>${icon} ${material.title}</h3>
                    <div class="subject">${material.subject} • ${this.getMaterialTypeName(material.type)}</div>
                </div>
                <div class="card-body">
                    <p>${material.description}</p>
                    <div class="meta-info">
                        <span class="teacher">👨‍🏫 Преподаватель: ${material.teacherName}</span>
                        <span class="groups">👥 Группы: ${material.groups && material.groups.length > 0 ? material.groups.join(', ') : 'Все'}</span>
                    </div>
                    <div class="file-info">
                        <span class="file-name">📎 ${material.fileName}</span>
                        <span class="file-size">${this.formatFileSize(material.fileSize)} • ${material.createdAt.toLocaleDateString('ru-RU')}</span>
                        ${material.downloads > 0 ? `<span class="download-count">📥 Скачано: ${material.downloads} раз</span>` : ''}
                    </div>
                </div>
                <div class="card-footer">
                    ${canDownload ? 
                        `<button class="download-btn" onclick="lecturesBase.downloadMaterial('${material.id}')">📥 Скачать</button>` : 
                        '<span class="uploaded">✅ Загружено</span>'
                    }
                    <span class="faculty">${this.getFacultyName(material.faculty)}</span>
                </div>
            </div>
        `;
    }

    createUserCard(user) {
        const roleIcon = user.role === 'admin' ? '⚙️' : user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓';
        const isCurrentUser = this.currentUser && this.currentUser.uid === user.uid;

        return `
            <div class="user-card">
                <div class="user-info">
                    <h4>${roleIcon} ${user.name} ${isCurrentUser ? '(Вы)' : ''}</h4>
                    <p>📧 ${user.email}</p>
                    <p>🎯 Роль: ${this.getRoleName(user.role)}</p>
                    <p>👥 Группа: ${user.group || '-'}</p>
                    <p>📅 Зарегистрирован: ${user.createdAt.toLocaleDateString('ru-RU')}</p>
                </div>
                <div class="user-actions">
                    ${!isCurrentUser ? `
                        <button class="btn-warning" onclick="lecturesBase.toggleUserStatus('${user.uid}')">
                            ${user.isActive ? '🔒 Заблокировать' : '🔓 Разблокировать'}
                        </button>
                        <button class="btn-danger" onclick="lecturesBase.deleteUser('${user.uid}')">🗑️ Удалить</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    createNoMaterialsHTML(message) {
        return `
            <div class="no-materials">
                <p>${message}</p>
                <small>Используйте форму загрузки для добавления материалов</small>
            </div>
        `;
    }

    downloadMaterial(materialId) {
        const material = this.materials.find(m => m.id === materialId);
        if (!material) return;

        // Увеличиваем счетчик скачиваний
        material.downloads = (material.downloads || 0) + 1;
        this.saveMaterials();

        // Логируем скачивание
        this.downloads.push({
            materialId: materialId,
            userId: this.currentUser.uid,
            userName: this.currentUser.name,
            downloadedAt: new Date()
        });
        this.saveDownloads();

        // Создаем временную ссылку для скачивания
        const link = document.createElement('a');
        link.href = material.fileUrl;
        link.download = material.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification(`Материал "${material.title}" скачивается`, 'success');

        // Обновляем интерфейс если нужно
        if (this.currentUser.role === 'teacher') {
            this.loadTeacherMaterials();
        }
        if (this.currentUser.role === 'admin') {
            this.loadAdminPanel();
        }
    }

    toggleUserStatus(userId) {
        const user = this.users.find(u => u.uid === userId);
        if (user) {
            user.isActive = !user.isActive;
            this.saveUsers();
            this.loadAdminPanel();
            this.showNotification(`Пользователь ${user.isActive ? 'разблокирован' : 'заблокирован'}`, 'success');
        }
    }

    deleteUser(userId) {
        if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            this.users = this.users.filter(u => u.uid !== userId);
            this.saveUsers();
            this.loadAdminPanel();
            this.showNotification('Пользователь удален', 'success');
        }
    }

    logoutUser(e) {
        e.preventDefault();
        this.currentUser = null;
        localStorage.removeItem('lecturesbase_currentUser');
        this.setupUI(null);
        this.showNotification('Вы вышли из системы', 'success');
    }

    // Вспомогательные методы
    getMaterialIcon(type) {
        const icons = {
            'lecture': '📖',
            'presentation': '📊',
            'methodology': '📋',
            'task': '📝',
            'reference': '📚'
        };
        return icons[type] || '📄';
    }

    getMaterialTypeName(type) {
        const types = {
            'lecture': 'Лекция',
            'presentation': 'Презентация',
            'methodology': 'Методичка',
            'task': 'Задание',
            'reference': 'Справочный материал'
        };
        return types[type] || type;
    }

    getRoleName(role) {
        const roles = {
            'student': 'Студент',
            'teacher': 'Преподаватель',
            'admin': 'Администратор'
        };
        return roles[role] || role;
    }

    getFacultyName(faculty) {
        const faculties = {
            'it': 'Информационные технологии',
            'economics': 'Экономика',
            'law': 'Юриспруденция',
            'engineering': 'Инженерия',
            'medicine': 'Медицина'
        };
        return faculties[faculty] || faculty;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Сохранение данных
    saveUsers() {
        localStorage.setItem('lecturesbase_users', JSON.stringify(this.users));
    }

    saveMaterials() {
        localStorage.setItem('lecturesbase_materials', JSON.stringify(this.materials));
    }

    saveDownloads() {
        localStorage.setItem('lecturesbase_downloads', JSON.stringify(this.downloads));
    }

    // Системные функции
    exportData() {
        const data = {
            users: this.users,
            materials: this.materials,
            downloads: this.downloads,
            exportedAt: new Date()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `lecturesbase_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Резервная копия данных экспортирована', 'success');
    }

    systemBackup() {
        this.exportData();
    }
}

// Глобальные функции для кнопок
function showCreateUserForm() {
    document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
}

function exportData() {
    if (lecturesBase.currentUser && lecturesBase.currentUser.role === 'admin') {
        lecturesBase.exportData();
    } else {
        lecturesBase.showNotification('Только администраторы могут экспортировать данные', 'error');
    }
}

function systemBackup() {
    if (lecturesBase.currentUser && lecturesBase.currentUser.role === 'admin') {
        lecturesBase.systemBackup();
    }
}

// Инициализация при загрузке страницы
let lecturesBase;
document.addEventListener('DOMContentLoaded', function() {
    lecturesBase = new LecturesBase();
    console.log('🚀 LecturesBase инициализирован');
});