# api/stats.py
from flask import Blueprint, jsonify
from models.interview import InterviewExperience

bp = Blueprint("stats", __name__)

@bp.route('/stats', methods=['GET'])
def get_stats():
    total_interviews = InterviewExperience.objects.count()
    companies        = len(InterviewExperience.objects.distinct('company'))

    all_docs         = InterviewExperience.objects.only('rounds')
    total_rounds     = sum(len(d.rounds) for d in all_docs)
    total_questions  = sum(
        len(r.questions) for d in all_docs for r in d.rounds
    )

    by_company = list(InterviewExperience.objects.aggregate([
        {"$group": {"_id": "$company", "count": {"$sum": 1}}},
        {"$sort":  {"count": -1}},
        {"$limit": 10}
    ]))

    by_year = list(InterviewExperience.objects.aggregate([
        {"$group": {"_id": "$year", "count": {"$sum": 1}}},
        {"$sort":  {"_id": -1}}
    ]))

    return jsonify({
        "total_interviews": total_interviews,
        "total_companies":  companies,
        "total_rounds":     total_rounds,
        "total_questions":  total_questions,
        "by_company":       [{"company": r["_id"], "count": r["count"]} for r in by_company],
        "by_year":          [{"year": r["_id"], "count": r["count"]} for r in by_year],
    })



# Keyword dictionary — substring match against question text (case-insensitive)
TOPIC_KEYWORDS = {
    "DSA": ["array", "linked list", "tree", "graph", "stack", "queue", "sort", "search", "recursion", "dynamic programming", "leetcode"],
    "SQL": ["sql", "join", "query", "normalization", "database query"],
    "DBMS": ["dbms", "transaction", "acid", "normalization", "primary key", "foreign key", "indexing"],
    "OOP": ["oop", "oops", "inheritance", "polymorphism", "encapsulation", "abstraction", "class", "object"],
    "OS": ["process", "thread", "deadlock", "scheduling", "operating system", "memory management"],
    "System Design": ["system design", "scalability", "load balancer", "microservice", "api design"],
    "Networking": ["networking", "tcp", "http", "rest api", "socket"],
    "Java": ["java"],
    "Python": ["python"],
    "C++": ["c++"],
    "React": ["react", "virtual dom", "jsx"],
}


@bp.route("/stats/topics", methods=["GET"])
def popular_topics():
    """
    GET /api/v1/stats/topics
    Response:
    [
      { "name": "DSA", "count": 412 },
      { "name": "SQL", "count": 198 },
      ...
    ]
    Counts questions whose text matches any keyword for a topic.
    A single question can count toward multiple topics if it matches multiple keyword sets.
    """
    try:
        docs = InterviewExperience.objects.only("rounds")
        topic_counts = {topic: 0 for topic in TOPIC_KEYWORDS}

        for doc in docs:
            for r in doc.rounds:
                for q in r.questions:
                    q_lower = q.lower()
                    for topic, keywords in TOPIC_KEYWORDS.items():
                        if any(kw in q_lower for kw in keywords):
                            topic_counts[topic] += 1

        # Sort descending, drop zero-count topics, return top 10
        sorted_topics = sorted(
            ({"name": k, "count": v} for k, v in topic_counts.items() if v > 0),
            key=lambda x: x["count"],
            reverse=True,
        )[:10]

        return jsonify(sorted_topics)

    except Exception as e:
        return jsonify({"error": str(e)}), 500