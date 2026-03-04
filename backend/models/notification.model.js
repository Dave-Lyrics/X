import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({ 
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The type below is the type of notification that will be sent which is follow and like. There are more types of notifications that can be added in the future such as comment, mention, reply etc. The enum property is used to restrict the values that can be assigned to the type field to only 'follow' and 'like'. This ensures that only valid notification types are stored in the database and helps maintain data integrity.
    type: {
        type: String,
        required: true,
        enum: ['follow', 'like']
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;