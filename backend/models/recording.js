'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recording extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Recording.belongsTo(models.Session, {
        foreignKey: 'session_id',
        as: 'session'
      });
    }
  }
  Recording.init({
    session_id: DataTypes.INTEGER,
    word_target: DataTypes.STRING,
    audio_s3_key: DataTypes.TEXT,
    phonemic_target: DataTypes.STRING,
    phonetic_transcription: DataTypes.STRING,
    error_type: DataTypes.STRING,
    sound_target: DataTypes.STRING,
    other_errors: DataTypes.TEXT,
    is_skipped: DataTypes.BOOLEAN,
    clean_audio_s3_key: DataTypes.TEXT,
    clean_audio_url: DataTypes.TEXT,
    is_processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Recording',
  });
  return Recording;
};