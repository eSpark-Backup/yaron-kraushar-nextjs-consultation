// lib/firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./jimple-f2911-firebase-adminsdk-7irwd-ff8287c5d8.json'); 





async function getRemoteConfigParameter(parameterName) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    const remoteConfig = admin.remoteConfig();
    const template = await remoteConfig.getTemplate();
    const parameter = template.parameterGroups.server.parameters[parameterName];

    if (parameter && parameter.defaultValue && parameter.defaultValue.value) {
      return parameter.defaultValue.value;
    } else {
      throw new Error(`Parameter ${parameterName} not found or has no default value`);
    }
  } catch (error) {
    console.error('Error fetching remote config parameter:', error);
    throw error;
  }
}

module.exports = { getRemoteConfigParameter };
