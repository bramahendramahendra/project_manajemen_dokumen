export type Status = 'complete' | 'uncomplete';

export type DASHBOARD = {
    logo: string;
    name: string;
    nameDocument: string;
    status: Status;
    dateTime: Date;
    link:string;
};
