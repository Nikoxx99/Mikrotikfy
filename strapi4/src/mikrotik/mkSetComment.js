module.exports.mkSetComment = async function (
  mikrotikHost,
  dni,
  code,
  model,
  comment
) {
  const conn = new RouterOSAPI({
    host: mikrotikHost,
    user: "API_ARNOP",
    password: strapi.config.get("server.admin.mikrotik.secret", "null"),
    port: 8087,
  });
  await conn.connect();
  if (
    comment !== "" &&
    comment != "0" &&
    comment != null &&
    comment != "null"
  ) {
    if (model === 1) {
      // eslint-disable-next-line no-unused-vars
      try {
        var com1 = await conn
          .write("/ppp/secret/set", ["=.id=" + code, "=comment=" + comment])
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            conn.close();
            return false;
          });
      } catch (error) {
        conn.close();
        return error;
      }
    } else {
      try {
        // eslint-disable-next-line no-redeclare
        var com1 = await conn
          .write("/ppp/secret/set", ["=.id=" + dni, "=comment=" + comment])
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            conn.close();
            return false;
          });
      } catch (error) {
        conn.close();
        return error;
      }
    }
  } else {
    conn.close();
    return true;
  }
  conn.close();
  if (com1.length > 0) {
    return true;
  } else {
    return true;
  }
};