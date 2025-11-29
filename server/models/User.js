import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['employee', 'manager'],
      default: 'employee',
    },
    employeeId: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  // Auto-generate employeeId if not provided
  if (!this.employeeId) {
    const rolePrefix = this.role === 'manager' ? 'MGR' : 'EMP';
    let employeeId;
    let isUnique = false;
    let counter = 1;

    while (!isUnique) {
      // Get count of existing users with similar pattern
      const UserModel = this.constructor;
      const existingCount = await UserModel.countDocuments({
        employeeId: new RegExp(`^${rolePrefix}`, 'i')
      }) || 0;

      // Generate employee ID: MGR001, EMP001, etc.
      const numPart = String(existingCount + counter).padStart(3, '0');
      employeeId = `${rolePrefix}${numPart}`;

      // Check if it's unique (exclude current document if updating)
      const query = { employeeId };
      if (!this.isNew) {
        query._id = { $ne: this._id };
      }
      const exists = await UserModel.findOne(query);
      if (!exists) {
        isUnique = true;
      } else {
        counter++;
      }
    }

    this.employeeId = employeeId;
  }

  // Hash password if modified
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
