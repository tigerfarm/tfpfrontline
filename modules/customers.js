// Module of customers to be loaded into a node program.
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

customers = [
    {
        customer_id: 1,
        display_name: 'Coleridge',
        company_name: 'Poets Inc',
        channels: [
            {type: 'sms', value: '+16503790077'}
        ],
        worker: 'dave@example.com',
        avatar: 'https://someassets-1403.twil.io/Coleridge.jpg'
    },
    {
        customer_id: 2,
        display_name: 'Percy Byshee Shelley',
        company_name: 'Poets Inc',
        channels: [
            {type: 'sms', value: '+16508661366'}
        ],
        worker: 'tigerfarm@gmail.com',
        avatar: 'https://someassets-1403.twil.io/Shelley.jpg'
    },
    {
        customer_id: 3,
        display_name: 'John Keats',
        company_name: 'Tiger Farm Press',
        channels: [
            {type: 'sms', value: '+16508661007'},
            {type: 'whatsapp', value: 'whatsapp:+16508661007'}
        ],
        worker: 'tigerfarm@gmail.com',
        avatar: 'https://someassets-1403.twil.io/Keats.jpg'
    },
    {
        customer_id: 33,
        display_name: 'Dave here',
        company_name: 'Poets Inc',
        channels: [
            {type: 'sms', value: '+16504837603'}
        ],
        worker: 'tigerfarm@gmail.com', // Okta Person username
        avatar: 'https://someassets-1403.twil.io/avatarMine1.jpg'
    },
    {
        customer_id: 34,
        display_name: 'Lord Byron',
        company_name: 'Poets Inc',
        channels: [
            {type: 'sms', value: '+16505552222'}
        ],
        worker: 'dave@example.com'
    }
];

exports.allCustomers = customers;

exports.workerCustomers = function (theWorker) {
    console.log("++ theWorker = " + theWorker);
    const workerCustomersList = customers.filter(customer => customer.worker === theWorker);
    return workerCustomersList.map(customer => ({
            display_name: customer.display_name,
            customer_id: customer.customer_id,
            avatar: customer.avatar
        }));
};

exports.customerDetails = function (theCustomerId) {
    console.log("++ theCustomerId = " + theCustomerId);
    const customerDetails = customers.find(customer => String(customer.customer_id) === String(theCustomerId));
    return ({customer: {
            customer_id: customerDetails.customer_id,
            display_name: customerDetails.display_name,
            channels: customerDetails.channels,
            links: customerDetails.links,
            avatar: customerDetails.avatar,
            details: customerDetails.details
        }
    });
};

exports.customerDetailsAll = function (theCustomerId) {
    console.log("++ theCustomerId = " + theCustomerId);
    const customerDetails = customers.find(customer => String(customer.customer_id) === String(theCustomerId));
    return (customerDetails);
};

// eof