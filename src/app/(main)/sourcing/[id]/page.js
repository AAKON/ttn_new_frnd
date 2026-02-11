"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSourcingDetails, submitComment, submitReply } from "@/services/sourcing";
import { useToast } from "@/hooks/use-toast";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";

const statusColors = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

export default function SourcingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startIndex = useRef(0);

  const handleDragStart = (e) => {
    isDragging.current = true;
    startX.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    startIndex.current = activeImage;
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
  };

  const handleDragEnd = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = e.type === "touchend" ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX.current - endX;
    const imgCount = (proposal?.images_urls || proposal?.images || []).length;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && startIndex.current < imgCount - 1) {
        setActiveImage(startIndex.current + 1);
      } else if (diff < 0 && startIndex.current > 0) {
        setActiveImage(startIndex.current - 1);
      }
    }
  };

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: proposal.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Loading proposal details...</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
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

  const images = proposal.images_urls || proposal.images || [];
  const categories = proposal.product_categories || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-5">
        <Link
          href="/sourcing"
          className="text-sm text-gray-500 hover:text-brand-600 inline-flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sourcing Proposals
        </Link>
      </div>

      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Date + Status */}
            <div className="flex items-center gap-3 mb-2">
              {proposal.created_at && (
                <span className="text-sm text-gray-400">
                  {new Date(proposal.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
              {proposal.status && (
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusColors[proposal.status] || "bg-gray-100 text-gray-600"}`}>
                  {proposal.status}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
              {proposal.title}
            </h1>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
              {proposal.company_name && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                  <span>{proposal.company_name}</span>
                </div>
              )}
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                  <span>{categories.map((c) => c.name).join(", ")}</span>
                </div>
              )}
              {proposal.location && (
                <div className="flex items-center gap-1.5">
                  {proposal.location.flag_path && (
                    <img src={proposal.location.flag_path} alt="" className="w-5 h-3.5 object-cover rounded-sm" />
                  )}
                  <span>{proposal.location.name}</span>
                </div>
              )}
              {proposal.view_count != null && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{proposal.view_count} views</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="!bg-gray-100 hover:!bg-gray-200 !text-gray-600 !p-2 !rounded-lg transition-colors"
              title="Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
            {session?.user?.id && proposal.user && Number(session.user.id) === Number(proposal.user.id) && (
              <Link
                href={`/sourcing/${id}/edit`}
                className="!bg-gray-100 hover:!bg-gray-200 !text-gray-600 !p-2 !rounded-lg transition-colors inline-flex"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </Link>
            )}
            <button
              className="!bg-gray-100 hover:!bg-gray-200 !text-gray-600 !p-2 !rounded-lg transition-colors"
              title="Favorite"
            >
              <svg className="w-5 h-5" fill={proposal.is_favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Images + Description + Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery - Draggable Slider */}
          {images.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="relative">
                {/* Main Image Slider */}
                <div
                  ref={sliderRef}
                  className="aspect-[3/1] md:aspect-[3/1] bg-gray-50 overflow-hidden cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <div
                    className="flex h-full transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${activeImage * 100}%)` }}
                  >
                    {images.map((img, index) => (
                      <div key={img.id || index} className="w-full h-full shrink-0">
                        <img
                          src={img.url || img.original_url || img.image || img}
                          alt={`${proposal.title} ${index + 1}`}
                          className="w-full h-full object-contain pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prev/Next Arrows */}
                {images.length > 1 && (
                  <>
                    {activeImage > 0 && (
                      <button
                        onClick={() => setActiveImage(activeImage - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 !bg-white/80 hover:!bg-white !text-gray-700 !p-1.5 !rounded-full shadow transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    {activeImage < images.length - 1 && (
                      <button
                        onClick={() => setActiveImage(activeImage + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 !bg-white/80 hover:!bg-white !text-gray-700 !p-1.5 !rounded-full shadow transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </>
                )}

                {/* Dot Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`!p-0 !rounded-full transition-all ${
                          index === activeImage
                            ? "!bg-brand-500 w-6 h-2"
                            : "!bg-white/70 w-2 h-2 hover:!bg-white"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto border-t border-gray-100">
                  {images.map((img, index) => (
                    <button
                      key={img.id || index}
                      onClick={() => setActiveImage(index)}
                      className={`!p-0 !bg-transparent shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${
                        index === activeImage
                          ? "border-brand-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img.url || img.original_url || img.image || img}
                        alt={`${proposal.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                <p className="text-gray-400 text-sm">No images available</p>
              </div>
            </div>
          )}

          {/* Description */}
          {proposal.description && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div
                className="prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: proposal.description }}
              />
            </div>
          )}

          {/* Info Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quantity */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Quantity</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {proposal.quantity ? `${proposal.quantity} ${proposal.unit || ""}`.trim() : "Not specified"}
              </p>
            </div>

            {/* Target Price */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Target Price</span>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {proposal.price ? `${proposal.currency || "USD"} ${proposal.price}${proposal.unit ? `/${proposal.unit}` : ""}` : "Not specified"}
              </p>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Payment</span>
              </div>
              <p className="text-base font-semibold text-gray-900 capitalize">
                {proposal.payment_method ? proposal.payment_method.replace(/_/g, " ") : "Not specified"}
              </p>
            </div>
          </div>

          {/* Delivery Info */}
          {proposal.delivery_info && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Delivery Information</h2>
              <p className="text-sm text-gray-600">{proposal.delivery_info}</p>
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-6">
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
                  className="!bg-brand-600 hover:!bg-brand-700 !text-white !px-6 !py-2 !rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">No comments yet. Be the first to comment.</p>
            ) : (
              <div className="space-y-5">
                {comments.map((comment) => (
                  <div key={comment.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                        <span className="text-brand-600 text-sm font-semibold">
                          {(comment.user?.first_name || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
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
                                className="!bg-brand-600 !text-white !px-4 !py-1.5 !rounded-lg text-xs font-semibold disabled:opacity-50"
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

        {/* Right Sidebar - Contact */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Posted By Card */}
            {proposal.user && (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-base font-bold">
                      {(proposal.user.first_name || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {proposal.user.first_name} {proposal.user.last_name}
                    </p>
                    {proposal.company_name && (
                      <p className="text-xs text-gray-500">{proposal.company_name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info Card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900">Contact Information</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Location / Address */}
                {proposal.location && (
                  <div className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">Location</p>
                      <div className="flex items-center gap-1.5">
                        {proposal.location.flag_path && (
                          <img src={proposal.location.flag_path} alt="" className="w-4 h-3 object-cover rounded-sm shrink-0" />
                        )}
                        <p className="text-sm font-medium text-gray-900 truncate">{proposal.location.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {proposal.email && (
                  <a href={`mailto:${proposal.email}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 truncate transition-colors">
                        {proposal.email}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}

                {/* WhatsApp */}
                {proposal.whatsapp && (
                  <a
                    href={`https://wa.me/${proposal.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-0.5">WhatsApp</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                        {proposal.whatsapp}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-green-500 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}

                {/* Phone */}
                {proposal.phone && (
                  <a href={`tel:${proposal.phone}`} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-brand-600 transition-colors">
                        {proposal.phone}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500 shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}

                {/* Address */}
                {proposal.address && (
                  <div className="px-5 py-3.5 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">Address</p>
                      <p className="text-sm font-medium text-gray-900">{proposal.address}</p>
                    </div>
                  </div>
                )}

                {/* No contact info */}
                {!proposal.location && !proposal.email && !proposal.whatsapp && !proposal.phone && !proposal.address && (
                  <div className="px-5 py-6 text-center">
                    <svg className="w-8 h-8 text-gray-200 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <p className="text-sm text-gray-400">No contact information</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
