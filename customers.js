// Module of customers to be loaded into a node program.
//      require('./customers.js');
// 
// -----------------------------------------------------------------------------
// CRM: Customer data.
// Example:
// [
//   {
//      customer_id: 98,
//      display_name: 'Bobby Shaftoe',
//      channels: [
//          { type: 'email', value: 'bobby@example.com' },
//          { type: 'sms', value: '+123456789' },
//          { type: 'whatsapp', value: 'whatsapp:+123456789' }
//      ],
//      links: [
//          { type: 'Facebook', value: 'https://facebook.com', display_name: 'Social Media Profile' }
//      ],
//      details:{
//          title: "Information",
//          content: "Status: Active" + "\n\n" + "Score: 100"
//      },
//      worker: 'john@example.com'
//   }
// ]

exports.customers = [
    {
        customer_id: 1,
        display_name: 'Coleridge',
        company_name: 'Poets Inc.',
        channels: [
            {type: 'sms', value: '+16505550077'}
        ],
        worker: 'lordbyron@example.com',
        avatar: 'https://abouttime-2357.twil.io/Coleridge.jpg'
    },
    {
        customer_id: 2,
        display_name: 'Percy Byshee Shelley',
        company_name: 'Poets Inc.',
        channels: [
            {type: 'sms', value: '+16505550007'}
        ],
        worker: 'dave@example.com',
        avatar: 'https://abouttime-2357.twil.io/Shelley.jpg'
    },
    {   customer_id: 3,
        display_name: 'John Keats',
        company_name: 'Poets Inc.',
        channels: [
            {type: 'sms', value: '+16505558893'}
        ],
        worker: 'dave@example.com',
        avatar: 'https://abouttime-2357.twil.io/Keats.jpg'
    },
    {
        customer_id: 33,
        display_name: 'Dave here',
        company_name: 'Tiger Farm Press',
        channels: [
            {type: 'sms', value: '+16505551111'}
        ],
        worker: 'dave@example.com',
        avatar: 'https://abouttime-2357.twil.io/avatarMine1.jpg'
    },
    {
        customer_id: 34,
        display_name: 'Lord Byron',
        company_name: 'Poets Inc.',
        channels: [
            {type: 'sms', value: '+16505552222'}
        ],
        worker: 'coleague@example.com'
    }
];

// eof