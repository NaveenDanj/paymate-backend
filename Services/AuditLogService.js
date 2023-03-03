const AuditLog = require("../Models/AuditLog");

const AuditLogRecord = async (req, res, type) => {
  let headers = req.headers;

  let audit_log_obj = new AuditLog({
    userId: req.user ? req.user : null,
    type: type,
    IPAddress: req.clientIp,
    request: req,
    response: res,
    headers: headers,
  });

  await audit_log_obj.save();

  return audit_log_obj;
};

module.exports = AuditLogRecord;
