```mermaid
flowchart TB
    %% === IDENTITY SCHEMA ===
    subgraph IDENTITY["🪪 identity"]
    parent_user_details["parent_user_details<br/>- user_id (PK)<br/>- first_name<br/>- last_name<br/>- phone<br/>- pesel<br/>- birth_date<br/>- home_address<br/>- workplace<br/>- gender<br/>- condition flags..."]
    children_tbl["children<br/>- id (PK)<br/>- parent_id (FK)<br/>- condition flags..."]
    property_users["property_users<br/>- property_id (PK)<br/>- user_id (PK)<br/>- role"]
    parent_partner_details["parent_partner_details<br/>- partner_id (PK)<br/>- first_name<br/>- last_name<br/>- phone<br/>- pesel<br/>- birth_date<br/>- home_address<br/>- workplace<br/>- gender<br/>- condition flags..."]
    end

    parent_user_details --> children_tbl
    parent_user_details --> property_users
    parent_user_details --> parent_partner_details

    %% === PROPERTY MANAGEMENT SCHEMA ===
    subgraph PROPERTY_MANAGEMENT["🏘️ property_management"]
    properties["properties<br/>- id (PK)<br/>- name<br/>- slug"]
    parent_doc_reqs["property_parent_document_requirements<br/>- property_id<br/>- document_type<br/>- requirement_type<br/>- condition_key<br/>- point_value"]
    children_doc_reqs["property_children_document_requirements<br/>- property_id<br/>- document_type<br/>- requirement_type<br/>- condition_key<br/>- point_value"]
    property_children_tbl["property_children<br/>- property_id (PK)<br/>- child_id (PK)<br/>- parent_id<br/>- points<br/>- approved"]
    end

    properties --> parent_doc_reqs
    properties --> children_doc_reqs
    properties --> property_children_tbl

    %% === REPORTING SCHEMA ===
    subgraph REPORTING["📊 reporting"]
    parent_documents["parent_documents<br/>- id (PK)<br/>- user_id<br/>- document_type<br/>- file_path"]
    children_documents["children_documents<br/>- id (PK)<br/>- child_id<br/>- document_type<br/>- file_path"]
    parent_partner_documents["parent_partner_documents<br/>- id (PK)<br/>- partner_id<br/>- document_type<br/>- file_path"]
    end

    %% === COMPLIANCE SCHEMA ===
    subgraph COMPLIANCE["🧾 compliance"]
    property_parent_documents_tbl["property_parent_documents<br/>- property_id (PK)<br/>- user_id (PK)<br/>- parent_document_id (PK)<br/>- document_type<br/>- request_status<br/>- approved_by<br/>- point_value"]
    property_children_documents_tbl["property_children_documents<br/>- property_id (PK)<br/>- child_id (PK)<br/>- child_document_id (PK)<br/>- document_type<br/>- request_status<br/>- approved_by<br/>- point_value"]
    property_parent_partner_documents_tbl["property_parent_partner_documents<br/>- property_id (PK)<br/>- partner_id (PK)<br/>- parent_partner_document_id (PK)<br/>- document_type<br/>- request_status<br/>- approved_by<br/>- point_value"]
    end

    %% === AUTH SCHEMA ===
    subgraph AUTH["🔐 auth"]
    jwks_tbl["jwks<br/>- id (PK)<br/>- publicKey<br/>- privateKey<br/>- createdAt"]
    user_tbl["user<br/>- id (PK)<br/>- name<br/>- email<br/>- emailVerified<br/>- image<br/>- createdAt<br/>- updatedAt"]
    session_tbl["session<br/>- id (PK)<br/>- userId<br/>- expiresAt<br/>- token<br/>- timestamps..."]
    account_tbl["account<br/>- id (PK)<br/>- userId<br/>- providerId<br/>- tokens..."]
    verification_tbl["verification<br/>- id (PK)<br/>- identifier<br/>- value<br/>- timestamps..."]
    end

    user_tbl --> session_tbl
    user_tbl --> account_tbl
```
