"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getSourcingDetails, submitComment, submitReply } from "@/services/sourcing";
import { useToast } from "@/hooks/use-toast";
import { getSession } from "next-auth/react";
import Link from "next/link";

export default function SourcingDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const fetchProposal = useCallback(async () => {
    try {
      setLoading(true);
      const session = await getSession();
      const token = session?.accessToken || null;
      const result = await getSourcingDetails(id, token);
      if (result?.data) {
        const data = result.data.data || result.data;
        setProposal(data);
        setComments(data.comments || []);
      }
    } catch (error) {
      // proposal remains null
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id, fetchProposal]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const result = await submitComment(id, commentText, toast);
      if (result?.status && result?.code === 200) {
        setCommentText("");
        fetchProposal();
      }
    } catch (error) {
      // Error handled by toast in service
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      const result = await submitReply(commentId, replyText, toast);
      if (result?.status && result?.code === 200) {
        setReplyText("");
        setReplyingTo(null);
        fetchProposal();
      }
    } catch (error) {
      // Error handled by toast in service
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-gray-500">Loading proposal details...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto py-16 text-center">
        <p className="text-gray-500 text-lg">Proposal not found.</p>
        <Link
          href="/sourcing"
          className="text-brand-600 hover:underline mt-4 inline-block text-sm"
        >
          &larr; Back to Sourcing Proposals
        </Link>
      </div>
    );
  }

  const images = proposal.images || [];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href="/sourcing"
          className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          &larr; Back to Sourcing Proposals
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images */}
        <div className="lg:col-span-1">
          {images.length > 0 ? (
            <div>
              <div className="border rounded-lg overflow-hidden mb-3">
                <img
                  src={images[activeImage]?.image || images[activeImage]}
                  alt={proposal.title}
                  className="w-full h-64 object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`!p-0 !bg-transparent shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        index === activeImage
                          ? "border-brand-600"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img.image || img}
                        alt={`${proposal.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg bg-gray-50 flex items-center justify-center h-64">
              <p className="text-gray-400">No images available</p>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
            {proposal.title}
          </h1>

          <div className="flex flex-wrap gap-3 mb-6">
            {proposal.quantity && (
              <span className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full border">
                Quantity: {proposal.quantity}
              </span>
            )}
            {proposal.category && (
              <span className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-200">
                {proposal.category.name || proposal.category}
              </span>
            )}
            {proposal.location && (
              <span className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full border">
                {proposal.location.name || proposal.location}
              </span>
            )}
            {proposal.created_at && (
              <span className="text-sm text-gray-400">
                Posted {new Date(proposal.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {proposal.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div
                className="paragraph text-gray-600"
                dangerouslySetInnerHTML={{ __html: proposal.description }}
              />
            </div>
          )}

          {proposal.user && (
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Posted by</h3>
              <p className="text-gray-900 font-medium">
                {proposal.user.first_name} {proposal.user.last_name}
              </p>
              {proposal.user.company_name && (
                <p className="text-sm text-gray-500">{proposal.user.company_name}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="input_style !h-auto resize-none"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="bg-brand-600 text-white px-6 py-2 rounded-md text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No comments yet. Be the first to comment.</p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <span className="text-brand-600 text-sm font-semibold">
                      {(comment.user?.first_name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {comment.user?.first_name} {comment.user?.last_name}
                      </span>
                      {comment.created_at && (
                        <span className="text-xs text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment.comment}</p>
                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === comment.id ? null : comment.id)
                      }
                      className="!bg-transparent !text-brand-600 text-xs !p-0 !font-normal mt-2 hover:underline"
                    >
                      Reply
                    </button>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                        className="mt-3"
                      >
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          rows={2}
                          className="input_style !h-auto resize-none text-sm"
                        />
                        <div className="mt-2 flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                            className="!bg-transparent !text-gray-500 text-xs !p-0 !font-normal hover:underline"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submitting || !replyText.trim()}
                            className="bg-brand-600 text-white px-4 py-1.5 rounded-md text-xs font-semibold disabled:opacity-50"
                          >
                            {submitting ? "Posting..." : "Reply"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                              <span className="text-gray-500 text-xs font-semibold">
                                {(reply.user?.first_name || "U").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-xs">
                                  {reply.user?.first_name} {reply.user?.last_name}
                                </span>
                                {reply.created_at && (
                                  <span className="text-xs text-gray-400">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-0.5">{reply.reply}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
