use junobuild_macros::{
    assert_delete_asset, assert_delete_doc, assert_set_doc, assert_upload_asset, on_delete_asset,
    on_delete_doc, on_delete_filtered_assets, on_delete_filtered_docs, on_delete_many_assets,
    on_delete_many_docs, on_set_doc, on_set_many_docs, on_upload_asset,
};
use junobuild_satellite::{
    include_satellite, AssertDeleteAssetContext, AssertDeleteDocContext, AssertSetDocContext,
    AssertUploadAssetContext, OnDeleteAssetContext, OnDeleteDocContext,
    OnDeleteFilteredAssetsContext, OnDeleteFilteredDocsContext, OnDeleteManyAssetsContext,
    OnDeleteManyDocsContext, OnSetDocContext, OnSetManyDocsContext, OnUploadAssetContext,
};
use serde::{Deserialize, Serialize};
use serde_json::{from_slice, to_vec};

#[derive(Serialize, Deserialize, Debug)]
struct Location {
    lat: f64,
    lng: f64,
}

#[derive(Serialize, Deserialize, Debug)]
struct Restaurant {
    name: String,
    category: String,
    address: String,
    location: Option<Location>,
    phone_number: Option<String>,
    business_hours: String,
    description: Option<String>,
    image_url: Option<String>,
    average_rating: Option<f64>,
    review_count: Option<u32>,
    created_at: Option<u64>,
    updated_at: Option<u64>,
    owner: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Review {
    restaurant_id: String,
    user_id: String,
    user_name: String,
    rating: u8,
    comment: Option<String>,
    visit_date: String,
    image_urls: Option<Vec<String>>,
    atmosphere_rating: Option<u8>,
    taste_rating: Option<u8>,
    service_rating: Option<u8>,
    value_price_rating: Option<u8>,
    cleanliness_rating: Option<u8>,
    created_at: Option<u64>,
    updated_at: Option<u64>,
}

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    email: Option<String>,
    profile_image_url: Option<String>,
    review_count: Option<u32>,
    created_at: Option<u64>,
    updated_at: Option<u64>,
}

// All the available hooks and assertions for your Datastore and Storage are scaffolded by default in this `lib.rs` module.
// However, if you don’t have to implement all of them, for example to improve readability or reduce unnecessary logic,
// you can selectively enable only the features you need.
//
// To do this, disable the default features in your `Cargo.toml` and explicitly specify only the ones you want to use.
//
// For example, if you only need `on_set_doc`, configure your `Cargo.toml` like this:
//
// [dependencies]
// junobuild-satellite = { version = "0.0.22", default-features = false, features = ["on_set_doc"] }
//
// With this setup, only `on_set_doc` must be implemented with custom logic,
// and other hooks and assertions can be removed. They will not be included in your Satellite.

#[on_set_doc]
async fn on_set_doc(_context: OnSetDocContext) -> Result<(), String> {
    // バリデーションは assert_set_doc で実行するため、ここでは何もしない
    Ok(())
}

#[on_set_many_docs]
async fn on_set_many_docs(_context: OnSetManyDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_doc]
async fn on_delete_doc(_context: OnDeleteDocContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_many_docs]
async fn on_delete_many_docs(_context: OnDeleteManyDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_filtered_docs]
async fn on_delete_filtered_docs(_context: OnDeleteFilteredDocsContext) -> Result<(), String> {
    Ok(())
}

#[on_upload_asset]
async fn on_upload_asset(_context: OnUploadAssetContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_asset]
async fn on_delete_asset(_context: OnDeleteAssetContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_many_assets]
async fn on_delete_many_assets(_context: OnDeleteManyAssetsContext) -> Result<(), String> {
    Ok(())
}

#[on_delete_filtered_assets]
async fn on_delete_filtered_assets(_context: OnDeleteFilteredAssetsContext) -> Result<(), String> {
    Ok(())
}

#[assert_set_doc]
fn assert_set_doc(context: AssertSetDocContext) -> Result<(), String> {
    let collection = &context.doc.collection;
    let data = &context.doc.data;
    
    match collection.as_str() {
        "restaurants" => validate_restaurant(data),
        "reviews" => validate_review(data),
        "users" => validate_user(data),
        _ => Ok(()), // その他のコレクションは許可
    }
}

#[assert_delete_doc]
fn assert_delete_doc(_context: AssertDeleteDocContext) -> Result<(), String> {
    Ok(())
}

#[assert_upload_asset]
fn assert_upload_asset(_context: AssertUploadAssetContext) -> Result<(), String> {
    Ok(())
}

#[assert_delete_asset]
fn assert_delete_asset(_context: AssertDeleteAssetContext) -> Result<(), String> {
    Ok(())
}

fn validate_restaurant(data: &[u8]) -> Result<(), String> {
    let restaurant: Restaurant = from_slice(data)
        .map_err(|e| format!("Invalid restaurant data: {}", e))?;
    
    // 必須フィールドのバリデーション
    if restaurant.name.trim().is_empty() {
        return Err("Restaurant name is required".to_string());
    }
    
    if restaurant.category.trim().is_empty() {
        return Err("Restaurant category is required".to_string());
    }
    
    if restaurant.address.trim().is_empty() {
        return Err("Restaurant address is required".to_string());
    }
    
    if restaurant.business_hours.trim().is_empty() {
        return Err("Business hours are required".to_string());
    }
    
    // カテゴリーの妥当性チェック
    let valid_categories = vec![
        "和食", "洋食", "中華", "イタリアン", "フレンチ", 
        "カフェ", "ラーメン", "焼肉", "寿司", "その他"
    ];
    
    if !valid_categories.contains(&restaurant.category.as_str()) {
        return Err(format!("Invalid category: {}", restaurant.category));
    }
    
    // 位置情報のバリデーション（存在する場合）
    if let Some(location) = &restaurant.location {
        if location.lat < -90.0 || location.lat > 90.0 {
            return Err("Invalid latitude: must be between -90 and 90".to_string());
        }
        if location.lng < -180.0 || location.lng > 180.0 {
            return Err("Invalid longitude: must be between -180 and 180".to_string());
        }
    }
    
    Ok(())
}

fn validate_review(data: &[u8]) -> Result<(), String> {
    let review: Review = from_slice(data)
        .map_err(|e| format!("Invalid review data: {}", e))?;
    
    // 必須フィールドのバリデーション
    if review.restaurant_id.trim().is_empty() {
        return Err("Restaurant ID is required".to_string());
    }
    
    if review.user_id.trim().is_empty() {
        return Err("User ID is required".to_string());
    }
    
    if review.user_name.trim().is_empty() {
        return Err("User name is required".to_string());
    }
    
    // レーティングのバリデーション（1-5の範囲）
    if review.rating < 1 || review.rating > 5 {
        return Err("Rating must be between 1 and 5".to_string());
    }
    
    // オプショナルレーティングのバリデーション
    if let Some(atmosphere_rating) = review.atmosphere_rating {
        if atmosphere_rating < 1 || atmosphere_rating > 5 {
            return Err("Atmosphere rating must be between 1 and 5".to_string());
        }
    }
    
    if let Some(taste_rating) = review.taste_rating {
        if taste_rating < 1 || taste_rating > 5 {
            return Err("Taste rating must be between 1 and 5".to_string());
        }
    }
    
    if let Some(service_rating) = review.service_rating {
        if service_rating < 1 || service_rating > 5 {
            return Err("Service rating must be between 1 and 5".to_string());
        }
    }
    
    if let Some(value_price_rating) = review.value_price_rating {
        if value_price_rating < 1 || value_price_rating > 5 {
            return Err("Value/price rating must be between 1 and 5".to_string());
        }
    }
    
    if let Some(cleanliness_rating) = review.cleanliness_rating {
        if cleanliness_rating < 1 || cleanliness_rating > 5 {
            return Err("Cleanliness rating must be between 1 and 5".to_string());
        }
    }
    
    // 日付フォーマットの簡易チェック（YYYY-MM-DD）
    if review.visit_date.len() != 10 || !review.visit_date.contains('-') {
        return Err("Visit date must be in YYYY-MM-DD format".to_string());
    }
    
    Ok(())
}

fn validate_user(data: &[u8]) -> Result<(), String> {
    let user: User = from_slice(data)
        .map_err(|e| format!("Invalid user data: {}", e))?;
    
    // 必須フィールドのバリデーション
    if user.name.trim().is_empty() {
        return Err("User name is required".to_string());
    }
    
    // メールアドレスの簡易バリデーション（存在する場合）
    if let Some(email) = &user.email {
        if !email.contains('@') || !email.contains('.') {
            return Err("Invalid email format".to_string());
        }
    }
    
    Ok(())
}

include_satellite!();
