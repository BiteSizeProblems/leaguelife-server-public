const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leagueSchema = new Schema({
  properties: {
    title: { type: String, required: true, unique: true },
    acronym: { type: String, required: true, unique: true },
    tagline: { type: String },
    description: { type: String },
    sims: [{ type: String }],
    beginnerFriendly: { type: Boolean },
    region: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    guildId: { type: String, default: ""  },
    tags: [{ type: String }],
    avatar: { type: String },
    banner: { type: String },
  },
  owner: { type: String, required: true, ref: 'User' },
  staff: [{ type: String, required: true, ref: 'User' }],
  members: [{ type: String, required: true, ref: 'User' }],
  drivers: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Driver' }],
  series: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Series' }],
  events: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Event' }]
}, { timestamps: true });

leagueSchema.pre('deleteOne', function (next) {
  const leagueId = this.getQuery()["_id"];
  mongoose.model("driver").deleteMany({'refs.league': leagueId}, function (err, result) {
      if (err) {
        console.log(`[error] ${err}`);
        next(err);
      } else {
        console.log('success');
        next();
      }
  });
});

  leagueSchema.virtual('leagueOwner', {
    ref: 'User',
    localField: 'owner',
    foreignField: '_id',
    justOne: true
  });
  
  leagueSchema.virtual('leagueStaff', {
    ref: 'User',
    localField: 'staff',
    foreignField: '_id'
  });

  leagueSchema.virtual('leagueMember', {
    ref: 'User',
    localField: 'members',
    foreignField: '_id'
  });

module.exports = mongoose.model('League', leagueSchema);

// When you `populate()` the `author` virtual, Mongoose will find the
// first document in the User model whose `_id` matches this document's
// `authorId` property.
/*blogPostSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

await BlogPost.create({ title: 'Introduction to Mongoose', authorId: 1 });
await User.create({ _id: 1, email: 'test@gmail.com' });

const doc = await BlogPost.findOne().populate('author');
doc.author.email; // 'test@gmail.com'*/

///

