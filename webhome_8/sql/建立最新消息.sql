CREATE TABLE public.最新消息 (
	id smallserial NOT NULL,
	主題 text NOT NULL,
	上版日期 date NULL,
	內容 text NULL,
	CONSTRAINT 最新消息_pk PRIMARY KEY (id)
);
