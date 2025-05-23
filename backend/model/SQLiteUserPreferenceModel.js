const { DataTypes, Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "userPreference.sqlite",
});

const UserPreference = sequelize.define("UserPreference", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: "userPreference", 
  },
  filter: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "none",
  },
  gridSize: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "1x4",
  },
  frameColor: { // Added frameColor field
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "#ffffff", // Default to white
  },
});

class _SQLiteUserPreferenceModel {
  constructor() {}

  async init(fresh = false) {
    await sequelize.authenticate();
    await sequelize.sync({ logging: console.log });
    
    if (fresh) {
      await this.deleteAll();
    }
    // Ensure default preferences exist
    const prefs = await this.read();
    if (!prefs) {
      await this.createDefault();
    }
  }

  async createDefault() {
    return await UserPreference.create({
      id: "userPreference",
      filter: "none",
      gridSize: "1x4",
      frameColor: "#ffffff", // Added frameColor to default creation
    });
  }

  async read() {
    return await UserPreference.findByPk("userPreference");
  }

  async update(preferences) {
    const toUpdate = await UserPreference.findByPk("userPreference");
    if (!toUpdate) {
      // Should not happen if init is called
      return await this.createDefault();
    }
    await toUpdate.update(preferences);
    return toUpdate;
  }

  async deleteAll() {
    await UserPreference.destroy({ truncate: true });
  }
}

const SQLiteUserPreferenceModel = new _SQLiteUserPreferenceModel();

module.exports = SQLiteUserPreferenceModel;
