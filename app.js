const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const prisma = new PrismaClient();
const Messages = require("./messages/message");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

require("dotenv").config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { auth } = require("./middleware/auth");
app.post("/create", async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        sttus: 400,
        message: Messages.Fields,
        error: {},
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        username: username,
        password: hashedPassword,
      },
    });
    return res.status(201).json({
      status: 201,
      message: Messages.Register,
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.get("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: Messages.Fields,
        data: {},
      });
    }
    const user = await prisma.user.findUnique({ where: { email: email } });
    if (!user) {
      return res.status(200).json({
        status: 200,
        message: Messages.Register,
        data: {},
      });
    }
    const loggedIn = await bcrypt.compare(password, user.password);
    if (loggedIn) {
      const token = await jwt.sign(
        {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).json({
        status: 200,
        message: "logged in success",
        token: token,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: Messages.Auth,
        data: {},
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.get("/user/:uid", auth, async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const users = await prisma.user.findMany({ where: { id: uid } });
    if (!users) {
      return res.status(400).json({
        status: 400,
        message: Messages.NotUser,
        data: {},
      });
    }
    return res.status(200).json({
      status: 200,
      message: Messages.Users,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.get("/users", auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    if (!users) {
      return res.status(400).json({
        status: 400,
        message: Messages.NotUser,
        data: {},
      });
    }
    return res.status(200).json({
      status: 200,
      message: Messages.Users,
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.put("/user/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    if (!id || !name || !email) {
      return res.status(400).json({
        sttus: 400,
        message: Messages.Fields,
        error: {},
      });
    }
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: Messages.NotUser,
        data: {},
      });
    }
    const userToUpdate = await prisma.user.update({
      where: { id: id },
      data: { name: name, email: email },
    });
    return res.status(200).json({
      status: 200,
      message: Messages.Updated,
      data: userToUpdate,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.delete("/user/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({
        sttus: 400,
        message: Messages.Fields,
        error: {},
      });
    }
    const user = await prisma.user.findMany({
      where: { id: id },
    });

    // const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.length <= 0) {
      return res.status(400).json({
        status: 400,
        message: Messages.NotUser,
        data: {},
      });
    }
    const userToDelete = await prisma.user.delete({
      where: { id: id },
    });
    console.log("userToDelete,userToDelete", userToDelete);
    return res.status(200).json({
      status: 200,
      message: Messages.Delete,
      data: userToDelete,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

//account apis
// app.post("/ac/create", async (req, res) => {
//   try {
//     const { acno, acname, uid } = req.body;
//     if (!acno || !acname || !uid) {
//       return res.status(400).json({
//         sttus: 400,
//         message: Messages.Fields
//         error: {},
//       });
//     }
//     const user = await prisma.user.findUnique({
//       where: { id: uid },
//     });
//     if (!user) {
//       return res.status(400).json({
//         status: 400,
//         message: "user not found",
//         data: {},
//       });
//     }
//     const account = await prisma.account.create({
//       data: {
//         acno: acno,
//         acname: acname,
//         uid: { connect: { id: uid } },
//       },
//     });
//     return res.status(201).json({
//       status: 201,
//       message: "created",
//       data: account,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: 500,
//       message: Messages.Ise,
//       err: err,
//     });
//   }
// });
// app.get("/ac/accounts", auth, async (req, res) => {
//   try {
//     console.log(req.user.id);
//     const accounts = await prisma.account.findMany({
//       include: { uid: true },
//       where: { user: req.user.id },
//     });
//     console.log(accounts);
//     accounts.forEach((acc) => {
//       delete acc.uid.password;
//     });
//     return res.status(200).json({
//       status: 200,
//       message: "Accounts fetched",
//       data: accounts,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: 500,
//       message: Messages.Ise,
//       err: err,
//     });
//   }
// });

// app.get("/ac/accounts/:uid", async (req, res) => {
//   try {
//     const uid = parseInt(req.params.uid);
//     if (!uid) {
//       return res.status(400).json({
//         sttus: 400,
//         message: "account id is require",
//         error: {},
//       });
//     }
//     console.log(uid);
//     const userAccount = await prisma.account.findMany({
//       include: { uid: true },
//       where: { user: uid },
//     });
//     return res.status(200).json({
//       status: 200,
//       message: "Accounts fetched",
//       data: userAccount,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: 500,
//       message: Messages.Ise,
//       err: err,
//     });
//   }
// });
// app.put("/ac/accounts/:aid", async (req, res) => {
//   try {
//     const aid = parseInt(req.params.aid);
//     const acname = req.body.acname;
//     if (!aid || acname) {
//       return res.status(400).json({
//         sttus: 400,
//         message: Messages.Fields
//         error: {},
//       });
//     }
//     const userAccount = await prisma.account.update({
//       include: { uid: true },
//       where: { id: aid },
//       data: { acname: acname },
//     });
//     return res.status(200).json({
//       status: 200,
//       message: "Accounts updated",
//       data: userAccount,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: 500,
//       message: Messages.Ise,
//       err: err,
//     });
//   }
// });
// app.delete("/ac/:aid", async (req, res) => {
//   try {
//     const aid = parseInt(req.params.aid);
//     if (!aid) {
//       return res.status(400).json({
//         sttus: 400,
//         message: "acount id is require",
//         error: {},
//       });
//     }
//     const accountToDelete = await prisma.account.delete({
//       where: { id: aid },
//     });
//     return res.status(200).json({
//       status: 200,
//       message: "Accounts deleted",
//       data: accountToDelete,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: 500,
//       message: Messages.Ise,
//       err: err,
//     });
//   }
// });

// Follow Unfollow

app.post("/following/:flwId", auth, async (req, res) => {
  try {
    const flwId = parseInt(req.params.flwId);
    const following = await prisma.followingFollwers.findMany({
      include: { fwing: true },
      where: {
        AND: [{ following: flwId }, { userId: req.user.id }],
      },
    });
    if (following.length === 1) {
      return res.status(400).json({
        stattus: 400,
        message: "Already following",
        data: {},
      });
    }
    const followingUser = await prisma.followingFollwers.create({
      data: {
        following: flwId,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      status: 201,
      message: "Following Success",
      data: followingUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.get("/following", auth, async (req, res) => {
  try {
    // const following = await prisma.followingFollwers.findMany({
    //   include: { fwing: true },
    //   where: { userId: req.user.id },
    // });

    const following = await prisma.user.findMany({
      select: { name: true, username: true, email: true },
      where: {
        following: {
          some: { userId: req.user.id },
        },
      },
    });
    return res.status(200).json({
      status: 200,
      message: "following get",
      data: following,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.get("/followers", auth, async (req, res) => {
  try {
    const followers = await prisma.user.findMany({
      select: {
        password: false,
        following: { select: { userId: true } },
      },
      // include: { following: true },
      where: {
        following: {
          some: {
            following: req.user.id,
          },
        },
      },
    });
    console.log(followers);
    let data = {
      followers: followers[0].following,
      cnt: followers[0].following.length,
    };
    return res.status(200).json({
      status: 200,
      message: "followers get",
      data: data,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.delete("/unfollow/:ufid", auth, async (req, res) => {
  try {
    const ufid = parseInt(req.params.ufid);
    const following = await prisma.followingFollwers.find({
      include: { fwing: true },
      where: {
        AND: [{ following: ufid }, { userId: req.user.id }],
      },
    });
    if (following.length === 0) {
      return res.status(400).json({
        status: 400,
        message: "You are not following this user",
        data: {},
      });
    }

    const unfollow = await prisma.followingFollwers.delete({
      where: {
        id: following[0].id,
      },
    });
    return res.status(200).json({
      status: 200,
      message: "unfollowed success",
      data: unfollow,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

//Post apis
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "./upload"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
app.post("/post/create", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, caption } = req.body;
    const image = req.file;
    const post = await prisma.post.create({
      data: {
        title: title,
        caption: caption,
        image: image,
        user: req.user.id,
      },
    });
    return res.status(201).json({
      status: 201,
      message: "post created successfully",
      data: post,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.get("/posts", auth, async (req, res) => {
  try {
    const posts = await prisma.user.findMany({
      include: { post: true },
      where: { id: req.user.id },
    });
    // if (posts.length < 1) {
    //   return res.status(200).json({
    //     status: 200,
    //     message: "No Posts Yet",
    //     data: {},
    //   });
    // }
    return res.status(200).json({
      status: 200,
      message: "Posts",
      data: posts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.delete("/post/delete/:pid", auth, async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const post = await prisma.post.findMany({ where: { id: pid } });
    console.log(post);
    const deletedPost = await prisma.post.deleteMany({
      where: { id: pid },
    });
    const unlinkAsync = promisify(fs.unlink);
    await unlinkAsync(
      path.join(__dirname, "upload" + "/" + post[0].image["filename"])
    );
    return res.status(200).json({
      status: 200,
      message: "Post deleted",
      data: deletedPost,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.post("/comment/:pid", auth, async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const comment = req.body.comment;
    const comments = await prisma.comment.create({
      data: {
        comment: comment,
        userId: req.user.id,
        postId: pid,
      },
    });
    return res.status(201).json({
      status: 201,
      message: "Comment added",
      data: comments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.put("/comment/:cid", auth, async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const { pid, comment } = req.body;
    const post = await prisma.post.findMany({
      where: {
        id: pid,
      },
    });
    if (post.length < 1) {
      return res.status(400).json({
        status: 400,
        message: "Post unavailable",
        data: post,
      });
    }
    const existingComment = await prisma.comment.findMany({
      where: {
        id: cid,
      },
    });
    if (existingComment.length < 1) {
      return res.status(400).json({
        status: 400,
        message: "you have not comment yet",
        data: existingComment,
      });
    }
    const updatedComment = await prisma.comment.updateMany({
      where: {
        AND: [{ userId: req.user.id }, { postId: pid }, { id: cid }],
      },
      data: {
        comment: comment,
      },
    });
    console.log(updatedComment);
    return res.status(200).json({
      status: 200,
      message: "comment updated",
      data: updatedComment,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.delete("/comment/:cid", auth, async (req, res) => {
  try {
    const cid = parseInt(req.params.id);
    const deleteComment = await prisma.comment.delete({
      where: { id: cid },
    });
    return res.status(200).json({
      status: 200,
      message: "comment deleted",
      data: deleteComment,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.get("/post/comments/:pid", auth, async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const postComments = await prisma.post.findMany({
      include: {
        comment: true,
      },
      where: {
        AND: [{ id: pid }, { user: req.user.id }],
      },
    });
    if (postComments.length < 1) {
      return res.status(400).json({
        status: 400,
        message: "no post found",
        data: {},
      });
    }
    return res.status(200).json({
      status: 200,
      message: "comment on posts",
      data: postComments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.post("/post/like/:pid", auth, async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const post = await prisma.post.findMany({
      where: {
        id: pid,
      },
    });
    if (post.length < 1) {
      return res.status(400).json({
        status: 400,
        message: "no post found",
        data: {},
      });
    }
    const likeDis = await prisma.likeDisLike.findMany({
      where: {
        AND: [{ userId: req.user.id }, { postId: pid }],
      },
    });
    if (likeDis.length >= 1) {
      return res.status(400).json({
        status: 400,
        message: "Already liked",
        data: {},
      });
    }
    const postLike = await prisma.likeDisLike.create({
      data: {
        likeby: { connect: { id: req.user.id } },
        post: { connect: { id: pid } },
      },
    });
    return res.status(201).json({
      status: 201,
      message: "post like success",
      data: postLike,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});

app.get("/post/likes", auth, async (req, res) => {
  try {
    // const likedPost =
    //   await prisma.$queryRaw`select u.username,u.email,p.title,p.caption,p.image, ld.userID, ld.postId from Batch.LikeDisLike as ld
    // left join Batch.User as u on ld.userId = u.id
    // left join Batch.Post as p on ld.postId= p.id
    // left join Batch.LikeDisLike as l on p.id = l.postId`;
    const likedPost = await prisma.likeDisLike.findMany({
      select: {
        likeby: {
          select: { id: true, name: true, username: true, email: true },
        },
        post: { select: { id: true, title: true, caption: true, image: true } },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Liked potss",
      data: likedPost,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.delete("/post/dislike/:pid", auth, async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const post = await prisma.post.findMany({
      where: {
        id: pid,
      },
    });
    if (post.length < 1) {
      return res.status(400).json({
        status: 400,
        message: "no post found",
        data: {},
      });
    }
    const likeDis = await prisma.likeDisLike.findMany({
      where: {
        AND: [{ userId: req.user.id }, { postId: pid }],
      },
    });

    if (likeDis.length < 1) {
      return res.status(400).json({
        status: 400,
        message: "Already disliked",
        data: {},
      });
    }

    const dislikePost = await prisma.likeDisLike.deleteMany({
      where: {
        AND: [
          { userId: req.user.id },
          {
            postId: pid,
          },
        ],
      },
    });
    return res.status(200).json({
      status: 200,
      message: "dislike success",
      data: dislikePost,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: Messages.Ise,
      err: err,
    });
  }
});
app.listen(3000);
module.exports = app;
