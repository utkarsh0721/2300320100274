**STAGE-2**

I recommend a relational database like PostgreSQL. Notifications are highly structured data that map perfectly to relational schemas.
PostgreSQL handles boolean filtering , timestamp sorting, and indexing exceptionally well.

Scaling problem 
As data volume increases to millions of rows, the primary problems will be slow read queries due to large table scans and storage bloat.

Solution : Move notifications older than 6 months to cold storage to keep the active table lightweight.





**STAGE-3**

Yes, the query is logically accurate and will return the correct data.

With 5,000,000 rows, the database is likely performing a Sequential Scan (checking every row one by one) because it lacks an appropriate index. Furthermore, sorting 5,000,000 potentially unindexed rows using ORDER BY createdAt DESC requires massive in-memory computation.

SQL
CREATE INDEX idx_student_unread_date ON notifications (studentId, isRead, createdAt DESC);

Indexing every column is a highly ineffective choice as indexes consume physical disk space and memory.every time an INSERT, UPDATE, or DELETE operation occurs, every single index must be updated. Indexing every column would drastically slow down write performance 


Last 7 day placement query
SELECT * FROM notifications 
WHERE notificationType = 'Placement' 
AND createdAt >= NOW() - INTERVAL '7 days';





**STAGE-5**

The loop runs synchronously. If send_email takes 500ms due to network latency, 50,000 users will take ~7 hours to process.

As seen in the logs, if it fails at user 200, the loop crashes. The remaining 49,800 users receive nothing, and there is no built-in way to resume from user 201 without risking duplicate emails to the first 199.

