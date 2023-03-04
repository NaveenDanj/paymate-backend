const AuditLog = require("../Models/AuditLog");
const { parse, stringify, toJSON, fromJSON } = require("flatted");

const AuditLogRecord = async (req, res, type) => {
  let headers = req.headers;

  let audit_log_obj = new AuditLog({
    userId: req.user ? req.user : null,
    type: type,
    IPAddress: req.socket.remoteAddress,
    request: stringify(req),
    response: stringify(res),
    headers: stringify(headers),
  });

  await audit_log_obj.save();

  return audit_log_obj;
};

module.exports = AuditLogRecord;
