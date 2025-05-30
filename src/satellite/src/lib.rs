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
use candid::{CandidType, Principal};
use ic_cdk_macros::{query, update, init};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use icrc_ledger_types::icrc1::account::{Account, Subaccount};
use std::cell::RefCell;
use std::collections::HashMap;
use num_traits::ToPrimitive;

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

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
struct ReviewLike {
    review_id: String,
    user_id: String,
    created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
struct TokenConfig {
    name: String,
    symbol: String,
    decimals: u8,
    total_supply: u64,
    max_supply: Option<u64>,
    mint_per_like: u64,
    canister_id: Principal,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
struct TokenBalance {
    user_id: String,
    balance: u64,
    last_updated: u64,
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

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static REVIEW_LIKES: RefCell<StableBTreeMap<String, ReviewLike, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    static TOKEN_BALANCES: RefCell<StableBTreeMap<String, TokenBalance, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );

    static TOKEN_CONFIG: RefCell<Option<TokenConfig>> = RefCell::new(None);
    static LIKE_COUNTS: RefCell<HashMap<String, u64>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    TOKEN_CONFIG.with(|config| {
        *config.borrow_mut() = Some(TokenConfig {
            name: "EatReview Token".to_string(),
            symbol: "ERT".to_string(),
            decimals: 8,
            total_supply: 0,
            max_supply: Some(1_000_000_000 * 100_000_000), // 10億トークン（8桁小数点）
            mint_per_like: 100_000_000, // 1トークン（8桁小数点考慮）
            canister_id: ic_cdk::api::id(),
        });
    });
}

#[query]
fn icrc1_name() -> String {
    TOKEN_CONFIG.with(|config| {
        config.borrow().as_ref().unwrap().name.clone()
    })
}

#[query]
fn icrc1_symbol() -> String {
    TOKEN_CONFIG.with(|config| {
        config.borrow().as_ref().unwrap().symbol.clone()
    })
}

#[query]
fn icrc1_decimals() -> u8 {
    TOKEN_CONFIG.with(|config| {
        config.borrow().as_ref().unwrap().decimals
    })
}

#[query]
fn icrc1_total_supply() -> u64 {
    TOKEN_CONFIG.with(|config| {
        config.borrow().as_ref().unwrap().total_supply
    })
}

#[query]
fn icrc1_balance_of(account: Account) -> u64 {
    let account_str = format!("{}", account.owner);
    TOKEN_BALANCES.with(|balances| {
        balances.borrow().get(&account_str)
            .map(|balance| balance.balance)
            .unwrap_or(0)
    })
}

#[update]
fn like_review(review_id: String, user_id: String) -> Result<String, String> {
    let like_key = format!("{}:{}", review_id, user_id);
    
    // 既にいいねしているかチェック
    let already_liked = REVIEW_LIKES.with(|likes| {
        likes.borrow().contains_key(&like_key)
    });
    
    if already_liked {
        return Err("Already liked this review".to_string());
    }
    
    let now = ic_cdk::api::time();
    let review_like = ReviewLike {
        review_id: review_id.clone(),
        user_id: user_id.clone(),
        created_at: now,
    };
    
    // いいねを記録
    REVIEW_LIKES.with(|likes| {
        likes.borrow_mut().insert(like_key, review_like);
    });
    
    // いいね数を更新
    LIKE_COUNTS.with(|counts| {
        let mut counts_map = counts.borrow_mut();
        let current_count = counts_map.get(&review_id).unwrap_or(&0);
        counts_map.insert(review_id.clone(), current_count + 1);
    });
    
    // トークンをmint
    match mint_tokens_for_like(user_id.clone()) {
        Ok(_) => Ok("Review liked and tokens minted successfully".to_string()),
        Err(e) => {
            // いいねは記録されたが、トークンmintに失敗
            Ok(format!("Review liked but token minting failed: {}", e))
        }
    }
}

// プライベート関数に変更（外部から直接呼び出し不可）
fn mint_tokens_for_like(user_id: String) -> Result<(), String> {
    let config = TOKEN_CONFIG.with(|config| {
        config.borrow().clone().unwrap()
    });
    
    // 最大供給量チェック（オーバーフロー対策）
    if let Some(max_supply) = config.max_supply {
        let new_supply = config.total_supply.checked_add(config.mint_per_like)
            .ok_or("Supply overflow".to_string())?;
        if new_supply > max_supply {
            return Err("Maximum supply reached".to_string());
        }
    }
    
    let now = ic_cdk::api::time();
    
    // ユーザーの残高を更新
    TOKEN_BALANCES.with(|balances| {
        let mut balances_map = balances.borrow_mut();
        let current_balance = balances_map.get(&user_id)
            .map(|b| b.balance)
            .unwrap_or(0);
        
        // オーバーフローチェック
        let new_balance_amount = current_balance.checked_add(config.mint_per_like)
            .ok_or("Balance overflow".to_string())?;
        
        let new_balance = TokenBalance {
            user_id: user_id.clone(),
            balance: new_balance_amount,
            last_updated: now,
        };
        
        balances_map.insert(user_id, new_balance);
    });
    
    // 総供給量を更新
    TOKEN_CONFIG.with(|config_cell| {
        let mut config = config_cell.borrow_mut();
        if let Some(ref mut config) = config.as_mut() {
            config.total_supply = config.total_supply.checked_add(config.mint_per_like)
                .expect("Total supply overflow");
        }
    });
    
    Ok(())
}

#[query]
fn get_review_likes(review_id: String) -> u64 {
    LIKE_COUNTS.with(|counts| {
        *counts.borrow().get(&review_id).unwrap_or(&0)
    })
}

#[query]
fn has_user_liked_review(review_id: String, user_id: String) -> bool {
    let like_key = format!("{}:{}", review_id, user_id);
    REVIEW_LIKES.with(|likes| {
        likes.borrow().contains_key(&like_key)
    })
}

#[query]
fn get_token_config() -> TokenConfig {
    TOKEN_CONFIG.with(|config| {
        config.borrow().clone().unwrap()
    })
}

// 管理者のみがトークン設定を変更できるようにする
#[update]
fn update_token_config(new_config: TokenConfig) -> Result<(), String> {
    let caller = ic_cdk::api::caller();
    // 開発者のプリンシパルIDをここに設定
    let admin_principal = Principal::from_text("your-admin-principal-id-here")
        .map_err(|_| "Invalid admin principal".to_string())?;
    
    if caller != admin_principal {
        return Err("Only admin can update token config".to_string());
    }
    
    TOKEN_CONFIG.with(|config| {
        *config.borrow_mut() = Some(new_config);
    });
    Ok(())
}

include_satellite!();
