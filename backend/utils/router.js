
module.exports.validateBody = function ({ include = [], schema = {} } = {}) {
    function customGet(obj, path) {
        return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : undefined), obj);
    }

    return function (req, res, next) {
        const errors = { required: [], invalid: [] };
        const body = req.body;

        if (Array.isArray(include)) {
            include.forEach((field) => {
                if (customGet(body, field) === undefined) {
                    errors.required.push(field);
                }
            });
        }

        if (typeof schema === 'object') {
            Object.entries(schema).forEach(([key, rules]) => {
                const value = customGet(body, key);
                
                if (rules.required && value === undefined) {
                    errors.required.push(key);
                }
                if (rules.type && value !== undefined && typeof value !== rules.type.name.toLowerCase()) {
                    errors.invalid.push(`${key} should be of type ${rules.type.name}`);
                }
                if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
                    errors.invalid.push(`${key} exceeds max length of ${rules.maxLength}`);
                }
            });
        }

        if (errors.required.length > 0 || errors.invalid.length > 0) {
            return res.status(400).json({ error: 'Validation failed', errors: {
                required: errors.required.join(', '),
                invalid: errors.invalid.join(', ')
            }});
        }
        next();
    };
};
