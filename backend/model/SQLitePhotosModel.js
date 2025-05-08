const { DataTypes, Sequelize } = require("sequelize");
// const betterSqlite3 = require('better-sqlite3');

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
  // dialectModule: betterSqlite3,
});

const Photo = sequelize.define("Photo", {
  photoid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  photo: { // the actual BLOB of the actual photo
    type: DataTypes.STRING,
    allowNull: false,
  },
  datetimeuploaded: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // maybe add more?
})

class _SQLitePhotoModel {
  constructor() {}

  async init(fresh = false) {
    await sequelize.authenticate();
    await sequelize.sync({ logging: console.log });
    // console.log("Synced sequelize");
    // An exception will be thrown if either of these operations fail.
    
    // reset it
    if (fresh) {
      await this.delete();
    }
  }

  async create(photo) {
    return await Photo.create(photo);
  }

  async read(id = null) {
    if (id) {
      return await Photo.findByPk(id);
    }

    return await Photo.findAll();
  }

  async update(photo) {
    const toUpdate = await Photo.findByPk(photo.photoid);
    if (!toUpdate) {
      return null;
    }

    await toUpdate.update(photo);
    return toUpdate;
  }

  async delete(photo = null) {
    if (photo === null) {
      console.log("deleted nothing because input photo was null");
      return null;
    }

    await Photo.destroy({ where: { photoid: photo.photoid } });
    return photo;
  }

  async deleteById(id) {
    await Photo.destroy({ where: { photoid: id }});
    return id;
  }

  async deleteAll() {
    await Photo.destroy({ truncate: true });
  }
}

const SQLitePhotoModel = new _SQLitePhotoModel();

module.exports = SQLitePhotoModel;