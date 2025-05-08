const { DataTypes, Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "settings.sqlite",
});

const Settings = sequelize.define("Settings", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: "settings", // Since we only have one set of settings
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  theme: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "light",
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "en",
  },
});

class _SQLiteSettingsModel {
  constructor() {}

  async init(fresh = false) {
    await sequelize.authenticate();
    await sequelize.sync({ logging: console.log });

    if (fresh) {
      await this.deleteAll();
    }
    // Ensure default settings exist
    const settings = await this.read();
    if (!settings) {
      await this.createDefault();
    }
  }

  async createDefault() {
    return await Settings.create({
      id: "settings",
      username: "",
      theme: "light",
      language: "en",
    });
  }

  async read() {
    return await Settings.findByPk("settings");
  }

  async update(newSettings) {
    const toUpdate = await Settings.findByPk("settings");
    if (!toUpdate) {
      // Should not happen if init is called
      return await this.createDefault();
    }
    await toUpdate.update(newSettings);
    return toUpdate;
  }

  async deleteAll() {
    await Settings.destroy({ truncate: true });
  }
}

const SQLiteSettingsModel = new _SQLiteSettingsModel();

module.exports = SQLiteSettingsModel;