const config = {
    host: 'localhost',
    database: 'saga_v1',
    user: 'spelwerk',
    password: 'spelwerk',
    waitForConnections: true,
    connectionLimit: 1000,
    queueLimit: 0,
    debug: false,
};

const fieldTitles = {
    description: 'Description',
    icon: 'Icon',
    name: 'Name',
};

const restrictedFields = [
    'id',
    'created',
    'deleted',
    'updated',
];

module.exports = {
    config,
    fieldTitles,
    restrictedFields,
};
