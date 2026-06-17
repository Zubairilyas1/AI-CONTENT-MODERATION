const Submission = require('../models/Submission');
const Verdict = require('../models/Verdict');
const Appeal = require('../models/Appeal');
const User = require('../models/User');
const Image = require('../models/Image');

exports.getAnalytics = async (req, res) => {
  try {
    const submissions = await Submission.find().lean();
    const verdicts = await Verdict.find().lean();
    const appeals = await Appeal.find().lean();
    const users = await User.find().lean();

    const volumeByDate = {};
    submissions.forEach((sub) => {
      const date = new Date(sub.created_at).toISOString().split('T')[0];
      volumeByDate[date] = (volumeByDate[date] || 0) + 1;
    });

    const submissionVolume = Object.entries(volumeByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const verdictDistribution = {
      Approved: 0,
      'Flagged for Review': 0,
      Blocked: 0,
    };
    verdicts.forEach((v) => {
      if (verdictDistribution[v.outcome] !== undefined) {
        verdictDistribution[v.outcome]++;
      }
    });

    const categoryDetections = {};
    verdicts.forEach((v) => {
      v.category_results.forEach((cr) => {
        if (cr.classification === 'detected') {
          categoryDetections[cr.category] = (categoryDetections[cr.category] || 0) + 1;
        }
      });
    });

    const categoryDistribution = Object.entries(categoryDetections).map(([category, count]) => ({
      category,
      count,
    }));

    const totalAppeals = appeals.length;
    const resolvedAppeals = appeals.filter((a) => a.status !== 'Pending');
    const acceptedAppeals = appeals.filter((a) => a.status === 'Accepted');
    const rejectedAppeals = appeals.filter((a) => a.status === 'Rejected');
    const pendingAppeals = appeals.filter((a) => a.status === 'Pending');

    const appealMetrics = {
      total: totalAppeals,
      pending: pendingAppeals.length,
      accepted: acceptedAppeals.length,
      rejected: rejectedAppeals.length,
      resolutionRate:
        resolvedAppeals.length > 0
          ? Math.round((resolvedAppeals.length / totalAppeals) * 100)
          : 0,
    };

    const submissionCountByUser = {};
    submissions.forEach((sub) => {
      const uid = sub.user_id.toString();
      submissionCountByUser[uid] = (submissionCountByUser[uid] || 0) + 1;
    });

    const violationCountByUser = {};
    const images = await Image.find().lean();
    const imageToSubmission = {};
    images.forEach((img) => {
      imageToSubmission[img._id.toString()] = img.submission_id.toString();
    });

    const submissionToUser = {};
    submissions.forEach((sub) => {
      submissionToUser[sub._id.toString()] = sub.user_id.toString();
    });

    verdicts.forEach((v) => {
      if (v.outcome !== 'Approved') {
        const img = images.find((i) => i._id.toString() === v.image_id.toString());
        if (img) {
          const subId = img.submission_id.toString();
          const userId = submissionToUser[subId];
          if (userId) {
            violationCountByUser[userId] = (violationCountByUser[userId] || 0) + 1;
          }
        }
      }
    });

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    const submissionLeaderboard = Object.entries(submissionCountByUser)
      .map(([userId, count]) => ({
        userId,
        name: userMap[userId]?.name || 'Unknown',
        email: userMap[userId]?.email || '',
        submissionCount: count,
      }))
      .sort((a, b) => b.submissionCount - a.submissionCount)
      .slice(0, 10);

    const violationLeaderboard = Object.entries(violationCountByUser)
      .map(([userId, count]) => ({
        userId,
        name: userMap[userId]?.name || 'Unknown',
        email: userMap[userId]?.email || '',
        violationCount: count,
      }))
      .sort((a, b) => b.violationCount - a.violationCount)
      .slice(0, 10);

    res.json({
      submissionVolume,
      verdictDistribution,
      categoryDistribution,
      appealMetrics,
      submissionLeaderboard,
      violationLeaderboard,
      totals: {
        submissions: submissions.length,
        verdicts: verdicts.length,
        users: users.length,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics.' });
  }
};
