export enum RoleEnum {
    Admin = 'admin',
    Teacher = 'teacher',
    User = 'user', // This is implicitly added by to all authenticated requests role.guard.ts
}
