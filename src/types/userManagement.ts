export type Status = 'success' | 'error';

export type USERMANAGEMENT = {
    name: string;
    userName: string;
    email: string
    noPhone: string;
    responsiblePerson: string;
    status: Status;
};
