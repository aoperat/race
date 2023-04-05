export class User {
    constructor(id, name, title, picture, speed, currentPosition ) {
        this.id = id;
        this.name = name;
        this.title = title;
        this.picture = picture;
        this.speed = speed;
        this.currentPosition = currentPosition;

    }

    updatePosition(newPosition) {
        this.currentPosition = newPosition;
    }

    static async fetchUsers() {
        try {
            const response = await fetch('users.json');
            const data = await response.json();
            return data.map(user => new User(user.id, user.name, user.title, user.picture, user.speed, 0));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

}
