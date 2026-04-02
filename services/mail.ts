export interface ExternalMail {
  id: string;
  referenceNumber: string;
  date: string;
  contact?: string;
  received_by?: string;
  from: string;
  status: "Not Received" | "Received";
}

// const MOCK_MAILS: ExternalMail[] = [
//     {
//         id: '1',
//         referenceNumber: 'VRA/EXT/2023/001',
//         date: '2023-10-25',
//         from: 'Ministry of Energy',
//         description: 'Quarterly Report Submission',
//         status: 'Pending',
//     },
//     {
//         id: '2',
//         referenceNumber: 'VRA/EXT/2023/002',
//         date: '2023-10-26',
//         from: 'EPA Ghana',
//         description: 'Environmental Compliance Audit',
//         status: 'Pending',
//     },
//     {
//         id: '3',
//         referenceNumber: 'VRA/EXT/2023/003',
//         date: '2023-10-27',
//         from: 'GRIDCo',
//         description: 'Interconnection Agreement',
//         status: 'Pending',
//     },
//     {
//         id: '4',
//         referenceNumber: 'VRA/EXT/2023/004',
//         date: '2023-10-28',
//         from: 'World Bank',
//         description: 'Project Funding Approval',
//         status: 'Received',
//     },
// ];

// export const MailService = {
//     getPendingMails: async (): Promise<ExternalMail[]> => {
//         // Simulate delay
//         await new Promise(resolve => setTimeout(resolve, 800));
//         return MOCK_MAILS.filter(m => m.status === 'Pending');
//     },

//     getAllMails: async (): Promise<ExternalMail[]> => {
//         await new Promise(resolve => setTimeout(resolve, 800));
//         return MOCK_MAILS;
//     },

//     confirmReceipt: async (id: string, signature: string, officerName: string, date: string): Promise<void> => {
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         const mail = MOCK_MAILS.find(m => m.id === id);
//         if (mail) {
//             mail.status = 'Received';
//         }
//     }
// };
