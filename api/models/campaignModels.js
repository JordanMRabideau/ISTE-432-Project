const sql = require("./db.js");

const Society = function(society) {
    this.socity_id = society.socity_id,
    this.name = society.name,
    this.member_count = society.member_count,
    this.auth1_name = society.auth1_name,
    this.auth2_name = society.auth2_name
}

Society.create = (newSociety, result) => {
    sql.query("INSERT INTO SOCIETY set ?", newSociety, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }

        console.log("Created Society: ", {...newSociety});
        result(null, {...newSociety})
    })
}

module.exports = Society;