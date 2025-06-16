CREATE TABLE public.課程內容2 (
	課程編號 varchar(50) NULL,
	組別 varchar(50) NULL,
	類別 varchar(50) NULL,
	課程名稱 varchar(50) NULL,
	教師姓名 varchar(50) NULL,
	上課時數 varchar(50) NULL,
	上課費用 varchar(50) NULL,
	開課日期 varchar(50) NULL,
	上課時間 varchar(50) NULL,
	學生人數 varchar(50) NULL,
	id smallserial NOT NULL,
	CONSTRAINT 課程內容2_pk PRIMARY KEY (id)
);
